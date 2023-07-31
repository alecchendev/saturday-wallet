import type { Component } from 'solid-js';
import { createMemo, For, Show, Match, Switch } from 'solid-js';
import GraphIcon from './icons/graph.svg';
import SearchIcon from './icons/search.svg';
import VisibleIcon from './icons/visible.svg';
import ArrowUpIcon from './icons/arrow-up.svg';
import ArrowDownIcon from './icons/arrow-down.svg';

const price = 29_000;

export enum PaymentDirection {
  Inbound,
  Outbound,
}

export enum PaymentStatus {
  Pending,
  Succeeded,
  Failed,
}

export type ActivityItemModel = {
  amountMsat: number,
  direction: PaymentDirection,
  status: PaymentStatus,
  date: Date,
}

const Activity: Component<{balanceSats: number, activityItems: ActivityItemModel[]}> = (props) => {
  return (
    <div class="overflow-y-auto">
      <ActivityTopBar />
      <Balance balanceSats={props.balanceSats} />
      <ActivityLog activityItems={props.activityItems} />
    </div>
  );
};

const ActivityTopBar: Component = () => {
  return (
    <div class="flex justify-between items-center w-full h-12 px-3">
      <GraphIcon class="w-7" />
      <SearchIcon class="w-7" />
    </div>
  )
}

const Balance: Component<{balanceSats?: number}> = (props) => {

  const balanceFiat = () => props.balanceSats * price / 100_000_000;

  return (
    <div class="flex flex-col justify-center items-center gap-y-1 h-40">
      <div class="flex">
        <h4 class="text-gray-500 font-medium">Your balance</h4>
        <VisibleIcon class="w-5 ml-1" />
      </div>
      <Show when={props.balanceSats} fallback={"Loading..."}>
        <h2 class="text-3xl">{props.balanceSats.toLocaleString()} sats</h2>
        <h3 class="text-xl font-light text-gray-500">${balanceFiat().toLocaleString("en-US", { maximumFractionDigits: 2 })}</h3>
      </Show>
    </div>
  )
}

const ActivityLog: Component<{activityItems?: Array<ActivityItemModel>}> = (props) => {
  return (
    <div class="px-5">
      <h2 class="text-xl font-medium pb-3">Activity</h2>
      <Show when={props.activityItems} fallback={<p>Loading...</p>}>
        <For each={props.activityItems} fallback={<p>No activity yet.</p>}>
          {(item, i) => (
            <div>
              <Show when={i() > 0}>
                <hr class="border-gray-200" />
              </Show>
              <ActivityItem payment={item} />
            </div>
          )}
        </For>
      </Show>
    </div>
  )
}

const ActivityItem: Component<{payment: ActivityItemModel}> = (props) => {
  const arrowDirection = props.payment.direction == PaymentDirection.Inbound ? ArrowDirection.Down : ArrowDirection.Up;
  const plusMinus = props.payment.direction == PaymentDirection.Inbound ? "+" : "-";
  const amountColor = props.payment.direction == PaymentDirection.Inbound ? "text-green-500" : "text-black-500";

  const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const description = props.payment.status === PaymentStatus.Pending ? "Pending..." : isYesterday(props.payment.date) ? "Yesterday" : props.payment.date.toLocaleDateString("en-US", dateOptions);
  const descriptionColor = props.payment.status === PaymentStatus.Pending ? "text-sky-500" : "text-black-500";
  const arrowCircleColor = props.payment.status === PaymentStatus.Pending ? "bg-sky-100 text-sky-500" : props.payment.direction == PaymentDirection.Inbound ? "bg-green-100 text-green-500" : "bg-gray-100 text-black-500";

  const amountSats = createMemo(() => props.payment.amountMsat / 1000);
  const amountFiat = createMemo(() => amountSats() * price / 100_000_000);

  const amountSatsStr = () => plusMinus + amountSats().toLocaleString() + " sats";
  const amountFiatStr = () => plusMinus + "$" + amountFiat().toLocaleString("en-US", { maximumFractionDigits: 2 });

  return (
    <div class="flex justify-between items-center py-3.5">
      <div class="flex items-center">
        <ArrowCircle direction={arrowDirection} color={arrowCircleColor} />
        <p class={descriptionColor}>{description}</p>
      </div>
      <div class="flex flex-col text-right">
        <p class={`text-sm ${amountColor}`}>{amountSatsStr()}</p>
        <p class="text-sm font-light text-gray-500">{amountFiatStr()}</p>
      </div>
    </div>
  )
}

enum ArrowDirection {
  Up,
  Down
}

const ArrowCircle: Component<{direction: ArrowDirection, color: string}> = (props) => {
  return (
    <div class={`flex justify-center items-center rounded-full w-9 h-9 mr-2.5 ${props.color}`}>
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

const getYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

const isYesterday = (date: Date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toLocaleDateString() == yesterday.toLocaleDateString();
}

export default Activity;
