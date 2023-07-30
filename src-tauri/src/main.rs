// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ldk_node::bitcoin::secp256k1::PublicKey;
use ldk_node::bitcoin::Network;
use ldk_node::io::SqliteStore;
use ldk_node::lightning_invoice::Invoice;
use ldk_node::{Builder, Config, NetAddress, Node};
use tauri::State;
use std::str::FromStr;

mod rpc;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
fn get_invoice(app: State<App>, amount_msat: u64, description: &str, expiry_secs: u32) -> String {
    let invoice = app.node.receive_payment(amount_msat, description, expiry_secs).unwrap();
    format!("{}", invoice)
}

#[tauri::command]
fn get_balance(app: State<App>) -> u64 {
    let onchain_balance = app.node.total_onchain_balance_sats().unwrap();
    let lightning_balance = app.node.list_channels().iter().map(|channel| channel.balance_msat).sum::<u64>() / 1000;
    onchain_balance + lightning_balance
}

struct App {
    node: Node<SqliteStore>,
}

fn main() {
    let mut config = Config::default();
    config.network = Network::Regtest;
    config.listening_address = Some(NetAddress::from_str("0.0.0.0:9733").unwrap());

    let mut builder = Builder::from_config(config);
    builder.set_esplora_server(ESPLORA_SERVER_URL.to_string());
    let node = builder.build().unwrap();

    node.start().unwrap();
    println!("Node connect info: {}@{}", node.node_id(), node.listening_address().unwrap());

    let funding_address = node.new_onchain_address().unwrap();
    println!("Funding address: {}", funding_address);
    println!(
        "onchan balance (sats): {}",
        node.total_onchain_balance_sats().unwrap()
    );

    tauri::Builder::default()
        .manage(App { node })
        .invoke_handler(tauri::generate_handler![greet, get_balance, get_invoice])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

const ESPLORA_SERVER_URL: &str = "http://127.0.0.1:3002";
const FAUCET_NODE_ID: &str = "0356deaa7bc4736cdcc12eb1cdd18dfcdebcefc87f1aae59bcd0421f5be8fb9da2";
const FAUCET_ADDR: &str = "127.0.0.1:9732";

fn main2() {
    // Welcome! Please run through the the following steps.
    // "..." marks where you'll need to add code.

    // Setup Config
    let mut config = Config::default();
    config.network = Network::Regtest;

    // Configure Esplora URL)
    //
    // ...

    // Setup Builder from config and build() node
    //
    let mut builder = Builder::from_config(config);
    builder.set_esplora_server(ESPLORA_SERVER_URL.to_string());
    let node = builder.build().unwrap();

    // Start LDK Node
    //
    node.start().unwrap();

    // Get a new funding address and have it funded via the faucet
    //
    let funding_address = node.new_onchain_address().unwrap();
    println!("Funding address: {}", funding_address);
    println!(
        "onchan balance (sats): {}",
        node.total_onchain_balance_sats().unwrap()
    );

    // Open channel to our node (see details above)
    //
    let faucet_node_id = PublicKey::from_str(FAUCET_NODE_ID).unwrap();
    let faucet_addr = NetAddress::from_str(FAUCET_ADDR).unwrap();
    let channel_amount_sats = 25_000;
    println!("Opening a channel with {} sats", channel_amount_sats);
    node.connect_open_channel(
        faucet_node_id,
        faucet_addr,
        channel_amount_sats,
        None,
        None,
        false,
    )
    .unwrap();

    //==============================================
    // We're now waiting for the channel to be confirmed:
    match node.wait_next_event() {
        ldk_node::Event::ChannelPending {
            channel_id,
            counterparty_node_id,
            ..
        } => println!(
            "New channel with {} pending confirmation: {:?}",
            counterparty_node_id, channel_id
        ),
        e => println!("Unexpected event: {:?}", e),
    }
    node.event_handled();

    // Wait for 6 blocks (a 15 secs)
    std::thread::sleep(std::time::Duration::from_secs(12));
    node.sync_wallets().unwrap();

    match node.wait_next_event() {
        ldk_node::Event::ChannelReady { channel_id, .. } => {
            println!("Channel {:?} is ready to be used!", channel_id)
        }
        e => println!("Unexpected event: {:?}", e),
    }
    node.event_handled();
    //==============================================

    // Parse invoice (Invoice::from_str)
    //
    let invoice = Invoice::from_str("lnbcrt100n1pjtr5q9dqud3jxktt5w46x7unfv9kz6mn0v3jsnp4qdtda2nmc3ekehxp96cum5vdln0tem7g0ud2ukdu6ppp7klglww6ypp5qaqpc8x602d3nc7r5es67cs2awj5se60t9346p0x6rlsjltzhp7qsp5t95m0cgycw9r59sysufuna3932ap3gty5dp7w26ntcjzttg8a35s9qyysgqcqpcxqrp9srzjqtllhakzd5rvf5mapaupwyzrtr7m3qmhprne28709du79dmdm6gz6qqqqyqqwnqqqyqqqqlgqqqqqqqqfqeacq52st5g4av3z97nghxxpscr3n9hexzksd55jthcehkhe07l795sg4xw4045dmrwxe73wsldkc87kj6edsk0g0gggml4fk3asz6nspw5sy6c").unwrap();

    // Pay invoice
    //
    node.send_payment(&invoice).unwrap();

    //==============================================
    // Wait for the payment to be successful.
    match node.wait_next_event() {
        ldk_node::Event::PaymentSuccessful { payment_hash } => {
            println!("Payment with hash {:?} successful!", payment_hash)
        }
        e => println!("Unexpected event: {:?}", e),
    }
    node.event_handled();
    node.stop().unwrap();
}

