using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class TonBridge : MonoBehaviour {
    public GameObject purchaseForm;
    private int amount = 0;

    public void SetPurchaseAmount(string amount) {
        if (int.TryParse(amount, out int parsedAmount)) {
            this.amount = parsedAmount;
        } else {
            Debug.Log("Could not parse amount: " + amount);
        }
    }

    public void OnWalletConnected(string address) {
        Debug.Log("A wallet have been connected!");
        Debug.Log(address);
        this.purchaseForm.SetActive(true);
    }

    public void OnWalletDisconnected() {
        Debug.Log("Wallet have been disconnected");
        this.purchaseForm.SetActive(false);
    }

    public void ConnectWallet() { Application.ExternalCall("tsdkConnect"); }

    public void DisconnectWallet() {
        Application.ExternalCall("tsdkDisconnect");
    }

    public void PurchaseGameToken(int amount) {
        Application.ExternalCall("tsdkPurchaseGameToken", this.amount);
    }
}
