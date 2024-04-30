using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TonBridge : MonoBehaviour {
    void Start() {}

    void Update() {}

    public void ExternalCall() {
        Debug.Log("ExternalCall");
        Application.ExternalCall("myJavascriptFunc");
    }
}
