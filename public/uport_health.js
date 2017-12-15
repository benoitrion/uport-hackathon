/* global Web3 globalState render */

// Setup

const Connect = window.uportconnect.Connect
const appName = 'Uport Health'
const connect = new Connect(appName, {network: 'rinkeby'})
const web3 = connect.getWeb3()


// Setup the simple AccessControl contract - allows you to add and revoke a professional access

const abi = [{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"addProfessional","outputs":[{"name":"addr","type":"string"},{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"revokeProfessional","outputs":[{"name":"addr","type":"string"},{"name":"revoked","type":"boolean"}],"payable":false,"type":"function"}];

const AccessControlContract = web3.eth.contract(abi);
const accessControlInstance = AccessControlContract.at('TBD')

// uPort connect
const uportConnect = function () {
    web3.eth.getCoinbase((error, address) => {
        if (error) { throw error }
        globalState.ethAddress = address

        // This one is for display purposes - MNID encoding includes network
        globalState.uportId = window.uportconnect.MNID.encode({network: '0x4', address: address})

        accessControlInstance.getPatientInformation.call(globalState.ethAddress, (err, patInfo) => {
            globalState.patientInformation = patInfo
            render()
        })
        accessControlInstance.getMedicalTreatments.call(globalState.ethAddress, (err, medTreat) => {
            globalState.medicalTreatments = medTreat
            render()
        })
        accessControlInstance.getListProfessionals.call(globalState.ethAddress, (err, profList) => {
            globalState.listProfessionals = profList
            render()
        })
        web3.eth.getBalance(globalState.ethAddress, (err, bal) => {
            globalState.ethBalance = web3.fromWei(bal)
                render()
        })

    })
}

// Revoke Access
const revokeAccess = () => {
    const revokedProfessional = globalState.revokedProfessional
    accessControlInstance.revokeAccess(revokedProfessional, (err, revoked) => {
        if (error) {
            throw error
        }
        if (revoked) {
            removeProfessionalFromList(revokedProfessional)
        }
    })
}


// Add Access
const addAccess = () => {

    const newProfessional = globalState.inputProfessional

    statusInstance.addAccess(newProfessional,
        (error, newProfessional, name) => {
            if (error) {
                throw error
            }
            addProfessionalToList(newProfessional, name)
        })
}

// Add Access

const getProfessionalList = () => {

    statusInstance.getProfessionalList(
        (error, professionalList) => {
            if (error) {
                throw error
            }
            globalState.listProfessionals = professionalList
            render()
        })
}