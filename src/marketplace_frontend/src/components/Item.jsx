import React, { useEffect, useState } from "react";
// import logo from "../../assets/logo.png";
// import  { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory,createActor } from "../../../declarations/nft";
import {Principal} from "@dfinity/principal"

function Item(props) {
  
  
  const [name,setName] = useState('');
  const [nftId,setId] = useState('');
  const [image,setImage] = useState('');
  const canisterId = props.nftId;
  const localhost = 'http://localhost:8080'
  // const agent = new HttpAgent({
  //   host: localhost,
  // });
  
  async function loadNFT(){


  const NFTActor = await createActor(canisterId,{host:localhost})
  // console.log(NFTActor)

  const name = await NFTActor.getName();
   const nftId = await NFTActor.getOwner();
   const content = await NFTActor.getAsset();
     const imageContent = new Uint8Array(content);
     const imageUrl = URL.createObjectURL(new Blob([imageContent.buffer],{type:"image/png"}))

    setName(name);
    setId(nftId.toText());
    setImage(imageUrl) 

  }

  useEffect(()=>{loadNFT()},[]);
    return (
      <div className="disGrid-item">
        <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
          <img
            className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
            src={image}
          />
          <div className="disCardContent-root">
            <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}<span className="purple-text"></span>
            </h2>
            <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
              Owner: {nftId}
            </p>
          </div>
        </div>
      </div>
    );
 
  

}

export default Item;
