// import { assert } from '@agoric/assert';
// import '@endo/init';
import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Far } from "@endo/marshal";
import { makeCapTP, E } from "@endo/captp";
import { makeAsyncIterableFromNotifier as iterateNotifier } from "@agoric/notifier";
import dappConstants from "../service/conf/defaults";

import {
  activateWebSocket,
  deactivateWebSocket,
  getActiveSocket,
} from "../service/utils/fetch-websocket";

const {
  INSTANCE_BOARD_ID,
  INSTALLATION_BOARD_ID,
  issuerBoardIds: { Character: CHARACTER_ISSUER_BOARD_ID },
  brandBoardIds: {
    Money: MONEY_BRAND_BOARD_ID,
    Character: CHARACTER_BRAND_BOARD_ID,
  },
} = dappConstants;

const initialState = {
  walletConnected: false,
  dappApproved: false,
  showApproveDappModal: false,
  tokenPurses: [],
  characterPurse: [],
  agoric: {
    zoe: undefined,
    board: undefined,
    instance: undefined,
    publicFacet: undefined,
  },
  isLoading: false,
};

const Context = (createContext < ServiceState) | (undefined > undefined);
const DispatchContext = (createContext < Dispatch) | (undefined > undefined);

const Reducer = (state, action) => {
  switch (action.type) {
    case "SET_DAPP_APPROVED":
      return { ...state, dappApproved: action.payload };

    case "SET_SHOW_APPROVE_DAPP_MODAL":
      return { ...state, showApproveDappModal: action.payload };

    case "SET_WALLET_CONNECTED":
      return { ...state, walletConnected: action.payload };

    case "SET_TOKEN_PURSES":
      return { ...state, tokenPurses: action.payload };

    case "SET_CHARACTER_PURSES":
      return { ...state, characterPurse: action.payload };

    case "SET_AGORIC":
      return { ...state, agoric: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "RESET":
      return initialState;

    default:
      throw new Error(`Only defined action types can be handled;`);
  }
};

export const ServiceStateProvider = (props) => {
  const [state, dispatch] = useReducer(Reducer, initialState);
  const walletPRef = useRef(undefined);
  const publicFacetRef = useRef(undefined);

  useEffect(() => {
    // Receive callbacks from the wallet connection.
    const otherSide = Far("otherSide", {
      needDappApproval(_dappOrigin, _suggestedDappPetname) {
        dispatch({ type: "SET_DAPP_APPROVED", payload: false });
        dispatch({ type: "SET_SHOW_APPROVE_DAPP_MODAL", payload: true });
      },
      dappApproved(_dappOrigin) {
        dispatch({ type: "SET_DAPP_APPROVED", payload: true });
      },
    });

    let walletAbort;
    let walletDispatch;

    const onConnect = async () => {
      console.info("Connecting to wallet...");

      dispatch({ type: "SET_WALLET_CONNECTED", payload: true });
      const socket = getActiveSocket();
      const {
        abort: ctpAbort,
        dispatch: ctpDispatch,
        getBootstrap,
      } = makeCapTP(
        "Card Store",
        (obj) => socket.send(JSON.stringify(obj)),
        otherSide
      );
      walletAbort = ctpAbort;
      walletDispatch = ctpDispatch;
      const walletP = getBootstrap();
      walletPRef.current = walletP;

      const processPurses = (purses) => {
        const newTokenPurses = purses.filter(
          ({ brandBoardId }) => brandBoardId === MONEY_BRAND_BOARD_ID
        );
        const newCharacterPurses = purses.find(
          ({ brandBoardId }) => brandBoardId === CHARACTER_BRAND_BOARD_ID
        );

        dispatch({ type: "SET_TOKEN_PURSES", payload: newTokenPurses });
        dispatch({ type: "SET_CHARACTER_PURSES", payload: newCharacterPurses });

        console.log("Token Purse Info: ", newTokenPurses[0].displayInfo);
        console.log("Token Purse Petname: ", newTokenPurses[0].brandPetname);
        console.log(
          "Character Purse Info: ",
          newCharacterPurses[0].displayInfo
        );
        console.log(
          "Character Purse Petname: ",
          newCharacterPurses[0].brandPetname
        );
      };

      async function watchPurses() {
        const pn = E(walletP).getPursesNotifier();
        for await (const purses of iterateNotifier(pn)) {
          // dispatch(setPurses(purses));
          processPurses(purses);
        }
      }
      watchPurses().catch((err) => console.error("got watchPurses err", err));

      await Promise.all([
        E(walletP).suggestInstallation("Installation", INSTALLATION_BOARD_ID),
        E(walletP).suggestInstance("Instance", INSTANCE_BOARD_ID),
        E(walletP).suggestIssuer("Character", CHARACTER_ISSUER_BOARD_ID),
      ]);

      const zoe = E(walletP).getZoe();
      const board = E(walletP).getBoard();
      const instance = await E(board).getValue(INSTANCE_BOARD_ID);
      const publicFacet = E(zoe).getPublicFacet(instance);
      publicFacetRef.current = publicFacet;

      dispatch({
        type: "SET_AGORIC",
        payload: { zoe, board, instance, publicFacet },
      });

      // TODO: fetch available characters

      // const availableItemsNotifier = E(
      //   publicFacetRef.current,
      // ).getAvailableItemsNotifier();

      // for await (const cardsAvailableAmount of iterateNotifier(
      //   availableItemsNotifier,
      // )) {
      //   setAvailableCards(cardsAvailableAmount.value);
      // }
    };

    const onDisconnect = () => {
      dispatch({ type: "SET_WALLET_CONNECTED", payload: true });
      walletAbort && walletAbort();
    };

    const onMessage = (data) => {
      const obj = JSON.parse(data);
      walletDispatch && walletDispatch(obj);
    };

    activateWebSocket({
      onConnect,
      onDisconnect,
      onMessage,
    });
    return deactivateWebSocket;
  }, []);

  return (
    <Context.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {props.children}
      </DispatchContext.Provider>
    </Context.Provider>
  );
};

export const useServiceState = () => {
  const state = useContext(Context);
  if (state === undefined) {
    throw new Error(
      "useServiceState can only be called inside a ServiceProvider."
    );
  }
  return state;
};

export const useServiceStateDispatch = () => {
  const dispatch = useContext(DispatchContext);
  if (dispatch === undefined) {
    throw new Error(
      "useServiceDispatch can only be called inside a ServiceProvider."
    );
  }
  return dispatch;
};

export const useServiceContext = () => [
  useServiceState(),
  useServiceStateDispatch(),
];
