use bitcoincore_rpc::{Auth, Client, RpcApi, bitcoin::Network};

// Default datadir relative to home directory
#[cfg(target_os = "windows")]
const DEFAULT_BITCOIN_DATADIR: &str = "AppData/Roaming/Bitcoin";
#[cfg(target_os = "linux")]
const DEFAULT_BITCOIN_DATADIR: &str = ".bitcoin";
#[cfg(target_os = "macos")]
const DEFAULT_BITCOIN_DATADIR: &str = "Library/Application Support/Bitcoin";

fn get_cookie_path(
    data_dir: Option<(&str, bool)>,
    network: Option<Network>,
    cookie_file_name: Option<&str>,
) -> Result<std::path::PathBuf, ()> {
    let data_dir_path = match data_dir {
        Some((dir, true)) => std::env::home_dir().ok_or(())?.join(dir),
        Some((dir, false)) => std::path::PathBuf::from(dir),
        None => std::env::home_dir()
            .ok_or(())?
            .join(DEFAULT_BITCOIN_DATADIR),
    };

    let data_dir_path_with_net = match network {
        Some(Network::Testnet) => data_dir_path.join("testnet3"),
        Some(Network::Regtest) => data_dir_path.join("regtest"),
        Some(Network::Signet) => data_dir_path.join("signet"),
        _ => data_dir_path,
    };

    let cookie_path = data_dir_path_with_net.join(cookie_file_name.unwrap_or(".cookie"));

    Ok(cookie_path)
}

fn get_rpc_client() -> Client {
    Client::new(
        "http://localhost:18443",
        Auth::CookieFile(get_cookie_path(None, Some(Network::Regtest), None).unwrap()),
    )
    .unwrap()
}
