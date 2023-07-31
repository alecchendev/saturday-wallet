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
fn pay_invoice(app: State<App>, invoice: &str) -> Result<[u8; 32], ()> {
    let invoice = Invoice::from_str(invoice).unwrap();
    match app.node.send_payment(&invoice) {
        Ok(payment_hash) => Ok(payment_hash.0),
        Err(_) => Err(()),
    }
}

#[tauri::command]
fn pay_spontaneous(app: State<App>, amount_msat: u64, node_id: &str) -> Result<[u8; 32], ()> {
    let node_id = PublicKey::from_str(node_id).unwrap();
    match app.node.send_spontaneous_payment(amount_msat, node_id) {
        Ok(payment_hash) => Ok(payment_hash.0),
        Err(_) => Err(()),
    }
}

#[tauri::command]
fn get_payments(app: State<App>) -> Vec<(u64, u8, u8)> {
    let payments = app.node.list_payments_with_filter(|payment| if let Some(amount_msat) = payment.amount_msat { amount_msat > 0 } else { false })
        .iter()
        .map(|payment| (
            payment.amount_msat.unwrap(),
            payment.direction as u8,
            payment.status as u8
        )).collect();
    payments
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

const ESPLORA_SERVER_URL: &str = "http://127.0.0.1:3002";

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
        .invoke_handler(tauri::generate_handler![get_balance, get_invoice, get_payments, pay_invoice, pay_spontaneous])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
