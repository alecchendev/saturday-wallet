import type { Component } from 'solid-js';
import { createResource } from 'solid-js';
import { Router, Route, Routes, A } from "@solidjs/router";
import { invoke } from "@tauri-apps/api";

import GearIcon from "./icons/gear.svg";
import PaymentsIcon from "./icons/flip-vertical.svg";
import TransactionsIcon from "./icons/transactions.svg";

import Payments from "./Payments";
import Activity from "./Activity";
import Settings from "./Settings";

const fetchBalance = async (): Promise<number> => {
  return await invoke("get_balance", {});
}

const App: Component = () => {

  const [balance] = createResource(fetchBalance);

  return (
    <Router>
        <div class="flex flex-col justify-between h-screen">
          <Routes>
            <Route path="/payments" element={<Payments />} />
            <Route path="/" element={<Activity balanceSats={balance()} />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <NavigationBar />
        </div>
    </Router>
  );
}

const NavigationBar: Component = () => {
  return (
    <div>
      <hr class="border-gray-300"/>
      <div class="flex justify-around items-center h-20 pb-2.5">
        <NavigationItem title="Payments" href="/payments" icon={PaymentsIcon} />
        <NavigationItem title="Activity" href="/" icon={TransactionsIcon} />
        <NavigationItem title="Settings" href="/settings" icon={GearIcon} />
      </div>
    </div>
  );
}

const NavigationItem: Component<{title: string, href: string, icon: any}> = (props) => {
  return (
    <A
      href={props.href}
      class="text-xs flex flex-col justify-center items-center"
      activeClass="text-orange-400"
      end={true}
    >
      <props.icon class="w-6" />
      <p>{props.title}</p>
    </A>
  );
}

export default App;
