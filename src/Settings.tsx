import type { Component, JSX } from "solid-js";
import { For } from "solid-js";
import CaretRightIcon from './icons/caret-right.svg';
import GearOutlineIcon from './icons/gear-outline.svg';
import CoinsIcon from './icons/coins.svg';
import LockIcon from './icons/lock.svg';
import KeyIcon from './icons/key.svg';
import WalletIcon from './icons/wallet.svg';
import QuestionMarkIcon from './icons/question-mark.svg';
import SafeIcon from './icons/safe.svg';

const Settings: Component = () => {
  return (
    <div>
      <Header />
      <Sections />
    </div>
  );
}

const Header: Component = () => {
  return (
    <div class="flex items-center w-full h-28 px-4">
      <h1 class="text-3xl">Settings</h1>
    </div>
  );
}

type SectionModel = {
  title: string,
  icon: any,
}

const Sections: Component = () => {
  const sections = [
    {title: "General", icon: GearOutlineIcon},
    {title: "Fees", icon: CoinsIcon},
    {title: "Privacy", icon: LockIcon},
    {title: "Security", icon: KeyIcon},
    {title: "Wallet backup", icon: WalletIcon},
    {title: "Help & Support", icon: QuestionMarkIcon},
    {title: "Advanced", icon: SafeIcon},
  ];

  return (
    <div class="flex flex-col px-4">
      <For each={sections}>
        {(section, i) => (
          <div>
            <hr class="border-gray-200" />
            <Section {...section} />
          </div>
        )}
      </For>
      <hr class="border-gray-200" />
    </div>
  );
}

const Section: Component<{title: string, icon: any}> = (props) => {
  return (
    <button class="w-full">
      <div class="flex justify-between items-center py-3.5">
        <div class="flex items-center">
          <props.icon class="w-7 mr-2 font-extrabold" />
          <p class="">{props.title}</p>
        </div>
        <CaretRightIcon class="w-4 text-gray-800" />
      </div>
    </button>
  );
}

export default Settings;
