import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import tokenAAbi from "../abi/tokenA.json";
import tokenBAbi from "../abi/tokenB.json";
import simpleSwapAbi from "../abi/SimpleSwap.json";

// Crear contexto
const BlockchainContext = createContext();

// Hook personalizado para usar el contexto
export const useBlockchain = () => useContext(BlockchainContext);

// Componente proveedor del contexto
export const BlockchainProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contracts, setContracts] = useState({});

  // Función para conectar la wallet de MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      try {
        const accounts = await ethProvider.send("eth_requestAccounts", []);
        const signer = await ethProvider.getSigner();
        setWallet(accounts[0]);
        setProvider(ethProvider);

        // Inicializar los contratos con signer
        const tokenA = new ethers.Contract(
          "0xDd79601DF7D1c17F783736d6fE6a87B7D170b0D7",
          tokenAAbi,
          signer
        );
        const tokenB = new ethers.Contract(
          "0xEA59ca4773DfC00B02B4d49AF911906550057ead",
          tokenBAbi,
          signer
        );
        const simpleSwap = new ethers.Contract(
          "0x39Ab6BCC04e85182fd1323b306F9F7900EC5Be10",
          simpleSwapAbi,
          signer
        );

        setContracts({ tokenA, tokenB, simpleSwap });
      } catch (err) {
        console.error("Error conectando con la wallet: ", err);
        alert("❌ Error al conectar con MetaMask");
      }
    } else {
      alert("🛑 MetaMask no está instalado.");
    }
  };

  // Función para desconectar la wallet
  const disconnectWallet = () => {
    setWallet(null);
    setContracts({});
    setProvider(null);
  };

  // Detectar cambios en la cuenta conectada (cambio de cuenta o red)
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => window.location.reload());
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  // Valor del contexto
  return (
    <BlockchainContext.Provider
      value={{ wallet, connectWallet, disconnectWallet, provider, contracts }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};
