import React, { useEffect, useState } from "react";
// import logo from "../../assets/logo.png";
 import  { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory,createActor } from "../../../declarations/nft";
import {Principal} from "@dfinity/principal"
import Button from "./Button";
import { marketplace_backend } from "../../../declarations/marketplace_backend";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";
import { idlFactory as tokenIdlFactory } from "../../../declarations/danktoken_backend/danktoken_backend.did.js";
function Item(props) {
  const [shoulDisplay,setDisplay] = useState(true);
  const [priceInput,setPriceInput] = useState();
  const [button,setButton] = useState();
  const [priceLabel,setPriceLabel] = useState();
  const [name,setName] = useState('');
  const [nftId,setId] = useState('');
  const [image,setImage] = useState('');
  const [loading,setLoading] = useState(true);
  const canisterId =props.nftId;
  const [blur, setBlur] = useState();
  const [sellStatus,setStatus] = useState("");

  // let NFTActor;
  // console.log(canisterId)
    
  // const localhost = 'http://localhost:8080'
  // // const agent = new HttpAgent({
  // //   host: localhost,
  // // });
  const localHost = "http://localhost:8080/";
  const agent = new HttpAgent({ host: localHost });

  //TODO: When deploy live, remove the following line.
  agent.fetchRootKey();
  let NFTActor;
  
  async function loadNFT(){


  //  NFTActor = await createActor(canisterId,{host:localhost})
  //  console.log(NFTActor)
  NFTActor = await Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });

  const name = await NFTActor.getName();
   const nftId = await NFTActor.getOwner();
   const content = await NFTActor.getAsset();
     const imageContent = new Uint8Array(content);
     const imageUrl = URL.createObjectURL(new Blob([imageContent.buffer],{type:"image/png"}))
    
    setName(name);
    setId(nftId.toText());
    setImage(imageUrl) 
    if(props.role == 'collection'){
    const nftListed = await marketplace_backend.isListed(canisterId);
    if(nftListed){
      setId("OpenD");
      setBlur({filter:"blur(4px)"});
      setStatus("Listed");
    }else{
      setButton(<Button handleClick={handleSell} text={"Sell"}/>);
    }
  }else if (props.role == 'discover'){
    const originalOwner = await marketplace_backend.getOriginalOwner(props.nftId);
   
    if(originalOwner.toText()!=CURRENT_USER_ID.toText()){
      setButton(<Button handleClick={handleBuy} text={"Buy"}/>);

    }
    const price = await marketplace_backend.getListedNFTPrice(canisterId);
    setPriceLabel(<PriceLabel value={price.toString()}/>)
   
  }


  }

  useEffect(()=>{loadNFT()},[]);
  let price;
  const handleSell = ()=>{
    setPriceInput(<input
      placeholder="Price in DANG"
      type="number"
      className="price-input"
      value={price}
      onChange={(e)=>price=e.target.value}
    />);
    setButton(<Button handleClick={sellItem} text={"Confirm"}/>)
  }

  async function sellItem() { 
    setBlur({filter:"blur(4px)"});
    setLoading(false);
const listingResult = await marketplace_backend.listItems(canisterId,Number(price));
console.log('Listing Result',listingResult);
if(listingResult == "Success"){
  const marketplace_backendID = await marketplace_backend.getOpenDCanisterId();
  const transferResult = await NFTActor.transferOwnership(marketplace_backendID);
  console.log('TransferResult',transferResult);
  if(transferResult == "Success"){
    setLoading(true);
    setButton();
    setPriceInput();
    setId("OpenD");
    setStatus("Listed");
  }
}
   }
   async function handleBuy() {console.log('Buyed');
   setLoading(false);
   const tokenActor = await Actor.createActor(tokenIdlFactory, {
    agent,
    canisterId:Principal.fromText('b77ix-eeaaa-aaaaa-qaada-cai'),//danktoken_backend
  });
  const sellerId = await marketplace_backend.getOriginalOwner(canisterId);
  const itemPrice = await marketplace_backend.getListedNFTPrice(canisterId);
  const result = await tokenActor.transfer(sellerId,itemPrice);
console.log('Result',result);
if(result == "Success"){
 const purchaseResult =  await marketplace_backend.completePurchase(canisterId,sellerId,CURRENT_USER_ID);
console.log('Purchase REsult',result);
 setLoading(true);
 setDisplay(false);
}
  
}
    return (
      <div style={{display:shoulDisplay?"inline":"none"}} className="disGrid-item">
     
        <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
          <img
            className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
            src={image}
            style={blur}
          />
              <div className="lds-ellipsis" hidden={loading}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
          <div className="disCardContent-root">
          {priceLabel}
            <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"> {sellStatus}</span>
            </h2>
            <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
              Owner: {nftId}
            </p>
            {priceInput}
            {button}
          </div>
        </div>
      </div>
    );
 
  

}

export default Item;
