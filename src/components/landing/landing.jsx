import { useState } from "react";
import { BaseCharacter, landing } from "../../assets";
import { useViewport } from "../../hooks";
import { styles } from "./styles";

export const Landing = () => {
  const { width, height } = useViewport();
  const [image, setImage] = useState(BaseCharacter);
  const [name, setName] = useState("");

  const handleImage = (e) => {
    setImage(e.target.value);
  };

  const handleName = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = (e) => {
    // TODO: do something
    e.preventDefault();
  };

  return (
    <div style={styles.container}>
      <img src={image} style={{width: `${width*0.4}px`, height:`${height}px`, marginRight: "50px"}} alt={name}/>
      <div style={styles.inputWrapper}>
      <div style={styles.inputContainer}>
        <input style={styles.input} placeholder={landing.url} type="text" onChange={handleImage}></input>
        <input style={styles.input} placeholder={landing.name} type="text" onChange={handleName}></input>
      </div>
      <button type="submit" style={styles.button} onSubmit={handleSubmit}>{landing.mint}</button>
      </div>
    </div>
  );
};
