/* global Web3 globalState render */

// Setup

var Connect = window.uportconnect.Connect
var appName = 'Uport Health'
var connect = new Connect(appName, {network: 'rinkeby'})
var web3 = connect.getWeb3()

// Config
var ipfsHost    = 'localhost',
    ipfsAPIPort = '5001',
    ipfsWebPort = '8080',
    //web3Host    = 'http://xepa.local',
    web3Host    = 'http://localhost',
    web3Port    = '8545';

// IPFS
var ipfs = window.IpfsApi(ipfsHost, ipfsAPIPort)
ipfs.swarm.peers(function(err, response) {
    if (err) {
        console.error(err);
    } else {
        console.log("IPFS - connected to " + response.Peers.length + " peers");
        console.log(response);
    }
});

// Setup the FileStorage contract - allows patient to store his medical history form

var abiFileStorage = [ { "constant": false, "inputs": [ { "name": "x", "type": "string" } ], "name": "set", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "get", "outputs": [ { "name": "x", "type": "string", "value": "111" } ], "payable": false, "stateMutability": "view", "type": "function" } ]
var FileStorageContract = web3.eth.contract(abiFileStorage)
var fileStorageInstance = FileStorageContract.at('0xA84B94f01dB9a1647D316395eeA5B11Ae5b2be5f')

var account = web3.eth.accounts[0];

var sendDataObject = {
    from: account,
    gas: 300000,
};

window.ipfs = ipfs;
window.web3 = web3;
window.account = account;
window.fileStorageInstance = fileStorageInstance;
window.accessControlInstance = accessControlInstance;
window.FileStorageContract = FileStorageContract;
window.AccessControlContract = AccessControlContract;
window.ipfsDataHost = "http://" + ipfsHost + ':' + ipfsWebPort + "/ipfs";
window.currentData = null

// uPort connect
function uportConnect() {
    web3.eth.getCoinbase((error, address) => {
        if (error) { throw error }

        // Patient address
        globalState.ethAddress = address

        // Display uportId - MNID encoding includes network
        globalState.uportId = window.uportconnect.MNID.encode({network: '0x4', address: address})

        web3.eth.getBalance(globalState.ethAddress, (err, bal) => {
            globalState.ethBalance = web3.fromWei(bal)
            render()
        })

        // Retrieve patient medical history form
        fileStorageInstance.getMedicalHistory.call(globalState.ethAddress, (err, medicalHistory) => {
            globalState.medicalHistory = medicalHistory
        })

    })
}

//Upload file

function upload() {
    const reader = new FileReader();
    reader.onloadend = function() {
        const buf = buffer.Buffer(reader.result)
        var dataHash = storeDataToIpfs(buf);
        console.log(dataHash)

        saveHash(dataHash);
    }
    const fileUpload = document.getElementById("file-upload");
    reader.readAsArrayBuffer(fileUpload.files[0]);
    console.log(fileUpload.files[0])
}
/*
// Retrieve uploaded files

function retrieveMedicalFiles() {

}*/

// Store data to ipfs

function storeDataToIpfs(data) {
    ipfs.add(data, function (err, result) {
        if (err) {
            console.error('Error storing data: ', err);
            return null;
        } else if (result && result[0] && result[0].Hash) {
            var url = window.ipfsDataHost + "/" + result[0].Hash;
            console.log(`'File: ' ${url}`)
            document.getElementById("url").innerHTML= url
            document.getElementById("url").href= url
            document.getElementById("output").src = url
            return result[0].Hash;
        } else {
            console.error('No file found...');
            return null;
        }
    })
}

// Save hash file to eth contract

function saveHash() {
    window.fileStorageInstance.set.sendTransaction(data, window.sendDataObject, function(err, result){
        if (err) {
            console.error('Error sending data: ', err);
        } else {
            window.currentData = data;
            console.log('Successfully sent data. Transaction hash: ', result);
        }
    });

}

// Retrieve hash file from eth contract

function retrieveHash() {
    window.fileStorageInstance.get.call(function(err, result){
        if (err) {
            console.error('Error getting data: ', err);
        } else if (result) {
            var imageURL = window.ipfsDataHost + "/" + result;
            console.log('File: ', result);
            console.log(imageURL);
        } else {
            console.error('No data. Transaction not mined yet?');
        }
    });
}

// Add Access
function addAccess(address) {
    accessControlInstance.addAccess(address,
        (error, address, name) => {
            if (error) {
                throw error
            }
            globalState.addedProfessionalAddress = address
            globalState.addedProfessionalName = name
        })
}

// Revoke Access
function revokeAccess(address) {
    accessControlInstance.revokeAccess(address, (error, address) => {
        if (error) {
            throw error
        }
        globalState.revokedProfessionalAddress = address
    })
}

// Retrieve professionals list

function getProfessionalList(address) {
    accessControlInstance.getProfessionalList(address,
        (error, professionalList) => {
            if (error) {
                throw error
            }
            globalState.listProfessionals = professionalList
        })
}