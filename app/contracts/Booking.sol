pragma solidity >=0.4.24;


contract Booking {

    struct Slot {
        uint256 idSlot;
        uint256 status; // if 0 means vacant if 1 means occupied
        bytes32 start;
        bytes32 end;
    }

    mapping(bytes32 => Slot[])  rooms;
    mapping(bytes32 => mapping(bytes32 => uint)) colaExists;
    mapping(bytes32 => mapping(bytes32 => uint)) pepsiExists;
    mapping(bytes32 => Slot[])  ColaRooms; // string is the ID of the room
    mapping(bytes32 => Slot[]) PepsiRooms;
    mapping(uint256 => uint256) slotAvailibilities; // slotID is unique for both companies so here we keep track of status
                                                    // because it is simpler than loopin on ColaRooms mapping to check
                                                    //if it is available

    bytes32 [10] public COLA;
    bytes32 [10] public PEPSI;

    bytes32 constant company_cola = "COLA";
   

    event Book(bytes32 idCompany, bytes32 idRoom, bytes32 start, bytes32 end, uint256 idSlot);
    event Cancel(bytes32 idCompany, bytes32 idRoom, bytes32 start, bytes32 end, uint256 idSlot);

    modifier onlyWhenAvailable(uint256 _idSlot)
    {
        require(
            slotAvailibilities[_idSlot] == 0, // even if key does not exist we will have default value 0 (canceled/not yet booked)
            "Not Available."
        );
        _;
    }

    constructor( bytes32 [10] memory _cola, bytes32 _idCola,  bytes32 [10] memory _pepsi, bytes32 _idPepsi) public{
        COLA = _cola;
        PEPSI = _pepsi;
        setUpColaPepsiRooms(_idCola, _idPepsi);

    }

    function setUpColaPepsiRooms(bytes32 _idCola, bytes32 _idPepsi) private {
        for(uint i=0; i<COLA.length; i++){
            colaExists[_idCola][COLA[i]] = 1;
            pepsiExists[_idPepsi][PEPSI[i]] = 1;
        }

    }



    function book(bytes32  idCompany, bytes32  idRoom, bytes32  start, bytes32  end, uint256 idSlot) external onlyWhenAvailable(idSlot){
        //make a require to check if roomID exists
        require(colaExists[idCompany][idRoom] ==1 || pepsiExists[idCompany][idRoom] ==1);
        Slot memory slot = Slot(idSlot, 1, start, end);
        slotAvailibilities[idSlot] = 1;
        rooms[idRoom].push(slot);
        emit Book(idCompany, idRoom, start, end, idSlot);
    }

    function cancel(bytes32  idCompany, bytes32  idRoom, bytes32  start, bytes32  end, uint256  idSlot) external{
        require(colaExists[idCompany][idRoom] ==1 || pepsiExists[idCompany][idRoom] ==1);
        Slot memory slot = Slot(idSlot, 0, "", "");
        rooms[idRoom].push(slot);
        slotAvailibilities[idSlot] = 0;
        emit Cancel(idCompany, idRoom, start, end, idSlot);
     }





}