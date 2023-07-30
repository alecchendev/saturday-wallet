import { Component, For, createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api";
import ContactsIcon from './icons/contacts.svg';
import FlipVerticalIcon from './icons/flip-vertical.svg';
import QrCodeIcon from './icons/qr-code.svg';
import toast from "solid-toast";

const fetchInvoice = async (amountMsat: number): Promise<string> => {
  return await invoke("get_invoice", {amountMsat, description: "", expirySecs: 15 * 60});
}

const copyInvoice = async (amountSats: number) => {
  let amountMsat = amountSats * 1000;
  let invoice = await fetchInvoice(amountMsat);
  navigator.clipboard.writeText(invoice);
  toast.success("Invoice copied to clipboard", {position: "top-center"});
}

const Payments: Component = () => {
  const [amountSats, setAmountSats] = createSignal(0);
  const pushDigit = (digit: number) => {
    // Restrict to 14 digits
    if (Math.ceil(Math.log10(amountSats() + 1)) <= 8) {
      setAmountSats(amountSats() * 10 + digit)
    }
  };
  const popDigit = () => setAmountSats(Math.floor(amountSats() / 10));

  return (
    <div class="flex flex-col justify-between">
      <PaymentsTopBar />
      <Amount amountSats={amountSats()}/>
      <NumberPad pushDigit={pushDigit} popDigit={popDigit} />
      <ButtonBar handleRequest={() => copyInvoice(amountSats())} />
    </div>
  );
}

const PaymentsTopBar: Component = () => {
  return (
    <div class="flex items-center w-full h-12 px-3">
      <ContactsIcon class="w-7" />
    </div>
  );
}

const Amount: Component<{amountSats: number}> = (props) => {

  const price = 29_000;
  const amountFiat = () => props.amountSats * price / 100_000_000;
  const subtitle = () => props.amountSats === 0 ? "Enter amount" : amountFiat().toLocaleString("en-US", { maximumFractionDigits: 2 }) + " $";

  return (
    <div class="flex flex-col justify-center items-center gap-y-2 h-40 my-20">
      <h2 class="text-5xl">{props.amountSats.toLocaleString()} sats</h2>
      <div class="flex">
        <h3 class="font-light text-2xl text-gray-500">{subtitle}</h3>
        <FlipVerticalIcon class="w-6 ml-2" />
      </div>
    </div>
  );
}

const NumberPad: Component<{pushDigit: Function, popDigit: Function}> = (props) => {
  return (
    <div class="flex flex-wrap justify-around items-center px-3">
      <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9]}>{(number, i) => (
        <NumberPadButton
          text={number.toString()}
          handleClick={() => props.pushDigit(number)}
        />
      )}</For>

      <NumberPadButton text={"."} handleClick={() => {}} />
      <NumberPadButton text={"0"} handleClick={() => props.pushDigit(0)} />
      <NumberPadButton text={"<"} handleClick={() => props.popDigit()} />
    </div>
  );
}

const NumberPadButton: Component<{text: string, handleClick: Function}> = (props) => {
  return (
    <button
      class="flex w-1/4 h-14 justify-center items-center m-0.5 text-2xl"
      onClick={() => props.handleClick()}
    >
      {props.text}
    </button>
  );
}

const ButtonBar: Component<{handleRequest: Function}> = (props) => {
  const buttonStyles = "flex justify-center items-center rounded-md bg-orange-400 text-white text-lg";
  const rectangleStyles = "w-2/5 h-12";
  return (
    <div class="flex justify-between mt-4 px-8">
      <button class={`${buttonStyles} ${rectangleStyles}`} onClick={() => props.handleRequest()} >Request</button>
      <button class={`${buttonStyles} w-12 h-12`}><QrCodeIcon class="w-9"/></button>
      <button class={`${buttonStyles} ${rectangleStyles}`}>Pay</button>
    </div>
  );
}

export default Payments;
