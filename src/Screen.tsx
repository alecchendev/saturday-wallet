import type { Component, JSX } from 'solid-js';
import { A } from '@solidjs/router';
import GearIcon from './icons/gear.svg';
import PaymentsIcon from './icons/flip-vertical.svg';
import TransactionsIcon from './icons/transactions.svg';

import Payments from './Payments';
import Activity from './Activity';
import Settings from './Settings';

const Screen: Component<{component: JSX.Element}> = (props) => {
  return (
    <div class="flex flex-col justify-between h-screen">
      {props.component}
      <NavigationBar />
    </div>
  );
}

const NavigationBar: Component = () => {
  return (
    <div>
      <hr class="border-gray-300"/>
      <div class="flex justify-around items-center h-20 pb-2.5">
        <NavigationItem title="Payments" href="/payments" icon={<PaymentsIcon class="w-6" />} />
        <NavigationItem title="Activity" href="/" icon={<TransactionsIcon class="w-6" />} />
        <NavigationItem title="Settings" href="/settings" icon={<GearIcon class="w-6" />} />
      </div>
    </div>
  );
}

const NavigationItem: Component<{title: string, href: string, icon: JSX.Element}> = (props) => {
  return (
    <A
      href={props.href}
      class="text-xs flex flex-col justify-center items-center"
      activeClass="text-orange-400"
      end={true}
    >
      {props.icon}
      <p>{props.title}</p>
    </A>
  );
}

const ActivityScreen: Component = () => {
  return (
    <Screen component={<Activity />} />
  );
}

const PaymentsScreen: Component = () => {
  return (
    <Screen component={<Payments />} />
  );
}

const SettingsScreen: Component = () => {
  return (
    <Screen component={<Settings />} />
  );
}

export { PaymentsScreen, ActivityScreen, SettingsScreen };
