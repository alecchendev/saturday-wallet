import type { Component } from 'solid-js';
import { createSignal, createMemo, For, Show, Match, Switch } from 'solid-js';
import GraphIcon from './icons/graph.svg';
import SearchIcon from './icons/search.svg';
import VisibleIcon from './icons/visible.svg';
import ArrowUpIcon from './icons/arrow-up.svg';
import ArrowDownIcon from './icons/arrow-down.svg';

const today = new Date();
const price = 29_000;

const getYesterday = () => {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

const isYesterday = (date: Date) => {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toLocaleDateString() == yesterday.toLocaleDateString();
}

const App: Component = () => {

  const [balanceSats, setBalanceSats] = createSignal(25_000);
  const [activityItems, setActivityItems] = createSignal([
    {paymentType: PaymentType.Sent, pending: true, date: new Date(), amount: 21_763},
    {paymentType: PaymentType.Sent, pending: false, date: getYesterday(), amount: 128_021},
    {paymentType: PaymentType.Received, pending: false, date: new Date("April 12, 2022"), amount: 1_706_950},
    {paymentType: PaymentType.Received, pending: false, date: new Date("April 9, 2022"), amount: 73_398},
    {paymentType: PaymentType.Sent, pending: false, date: new Date("April 4, 2022"), amount: 139_969},
  ]);

  return (
    <div>
      <ActivityTopBar />
      <Balance balanceSats={balanceSats()} />
      <Activity activityItems={activityItems()} />
    </div>
  );
};

type ActivityItemModel = {
  paymentType: PaymentType,
  pending: boolean,
  date: Date,
  amount: number,
}

const Activity: Component<{activityItems: Array<ActivityItemModel>}> = (props) => {
  return (
    <div class="px-5">
      <h2 class="text-xl font-medium pb-3">Activity</h2>
      <For each={props.activityItems} fallback={<p>No activity yet.</p>}>
        {(item, i) => (
          <div>
            <Show when={i() > 0}>
              <hr class="border-gray-200" />
            </Show>
            <ActivityItem {...item} />
          </div>
        )}
      </For>
    </div>
  )
}

enum PaymentType {
  Sent,
  Received,
}

const ActivityItem: Component<{paymentType: PaymentType, pending: boolean, date: Date, amount: number}> = (props) => {
  const arrowDirection = props.paymentType == PaymentType.Received ? ArrowDirection.Down : ArrowDirection.Up;
  const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const description = props.pending ? "Pending..." : isYesterday(props.date) ? "Yesterday" : props.date.toLocaleDateString("en-US", dateOptions);
  const descriptionColor = props.pending ? "text-sky-500" : "text-black-500";
  const amountFiat = createMemo(() => props.amount * price / 100_000_000);
  const plusMinus = props.paymentType == PaymentType.Received ? "+" : "-";
  const amountColor = props.paymentType == PaymentType.Received ? "text-green-500" : "text-black-500";

  return (
    <div class="flex justify-between items-center py-3.5">
      <div class="flex items-center">
        <ArrowCircle direction={arrowDirection} pending={props.pending} />
        <p class={descriptionColor}>{description}</p>
      </div>
      <div class="flex flex-col text-right">
        <p class={`text-sm ${amountColor}`}>{plusMinus}{props.amount.toLocaleString()} sats</p>
        <p class="text-sm font-light text-gray-500">{plusMinus}{amountFiat().toLocaleString()} $</p>
      </div>
    </div>
  )
}

enum ArrowDirection {
  Up,
  Down
}

const ArrowCircle: Component<{direction: ArrowDirection, pending: boolean}> = (props) => {
  const color = props.pending ? "bg-sky-100 text-sky-500" : props.direction == ArrowDirection.Down ? "bg-green-100 text-green-500" : "bg-gray-100 text-black-500";
  return (
    <div class={`flex justify-center items-center rounded-full w-9 h-9 mr-2.5 ${color}`}>
      <Switch>
        <Match when={props.direction == ArrowDirection.Up}>
          <ArrowUpIcon class="w-3/5" />
        </Match>
        <Match when={props.direction == ArrowDirection.Down}>
          <ArrowDownIcon class="w-3/5" />
        </Match>
      </Switch>
    </div>
  )
}

const Balance: Component<{balanceSats: number}> = (props) => {

  const balanceFiat = createMemo(() => props.balanceSats * price / 100_000_000);

  return (
    <div class="flex flex-col justify-center items-center gap-y-1 h-40">
      <div class="flex">
        <h4 class="text-gray-500 font-medium">Your balance</h4>
        <VisibleIcon class="w-5 ml-1" />
      </div>
      <h2 class="text-3xl">{props.balanceSats.toLocaleString()} sats</h2>
      <h3 class="text-xl">{balanceFiat().toLocaleString()} $</h3>
    </div>
  )
}

const ActivityTopBar: Component = () => {
  return (
    <div class="flex justify-between items-center w-full h-12 px-3">
      <GraphIcon class="w-7" />
      <SearchIcon class="w-7" />
    </div>
  )
}

export default App;
