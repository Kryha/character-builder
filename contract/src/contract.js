// @ts-check
import '@agoric/zoe/exported';

import { makeIssuerKit, AssetKind, AmountMath } from '@agoric/ertp';
import { Far } from '@endo/marshal';
import { E } from '@endo/eventual-send';

import { FIRST_PRICE } from '@agoric/zoe/src/contracts/auction';

/**
 * This contract mints non-fungible tokens (Nft) and creates a contract
 * instance to auction the Nft in exchange for some sort of money.
 *
 * @type {ContractStartFn}
 */
const start = (zcf) => {
  const zoeService = zcf.getZoeService();
  const mintNft = async (
    nfts,
    moneyIssuer,
    auctionInstallation,
    auctionItemsInstallation,
    minBidPerCard,
    timeAuthority,
  ) => {
    const newNftForSaleAmount = ;
    const allNftForSalePayment = ;

    const proposal = harden({
      give: { Items: newNftForSaleAmount },
    });

    const paymentKeywordRecord = harden({ Items: allNftForSalePayment });

    const issuerKeywordRecord = harden({
      Items: issuer,
      Money: moneyIssuer,
    });

    const auctionItemsTerms = harden({
      bidDuration: 1n,
      winnerPriceOption: FIRST_PRICE,
      ...zcf.getTerms(),
      auctionInstallation,
      minimalBid: minBidPerCard,
      timeAuthority,
    });

    const { creatorInvitation, creatorFacet, instance, publicFacet } = await E(
      zoeService,
    ).startInstance(
      auctionItemsInstallation,
      issuerKeywordRecord,
      auctionItemsTerms,
    );

    const shouldBeInvitationMsg = `The auctionItemsContract instance should return a creatorInvitation`;
    assert(creatorInvitation, shouldBeInvitationMsg);

    await E(zoeService).offer(
      creatorInvitation,
      proposal,
      paymentKeywordRecord,
    );
    return harden({
      auctionItemsCreatorFacet: creatorFacet,
      auctionItemsInstance: instance,
      auctionItemsPublicFacet: publicFacet,
    });
  };

  const creatorFacet = Far('Nft creator', {
    mintNft,
    getIssuer: () => ,
  });

  return harden({ creatorFacet });
};

harden(start);
export { start };
