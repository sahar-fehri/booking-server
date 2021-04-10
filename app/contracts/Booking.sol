pragma solidity >=0.4.24;


contract Booking {

    struct Slot {
        bytes32 idSlot;
        uint256 status; // if 0 means vacant if 1 means occupied
        bytes32 start;
        bytes32 end;
    }

    struct Appointment{
        bytes32 idSlot;
        bytes32 idCompany;
    }


    mapping(bytes32 => Slot[])  rooms;
    mapping(bytes32 => mapping(bytes32 => uint)) colaExists;
    mapping(bytes32 => mapping(bytes32 => uint)) pepsiExists;
    mapping(bytes32 => Slot[])  ColaRooms; // bytes32 is the ID of the room
    mapping(bytes32 => Slot[]) PepsiRooms;
    mapping(bytes32 => bool) slotAvailibilities;
    mapping(bytes32 => bool ) isAvailable;
    mapping(bytes32 => Appointment ) availabilities;


    bytes32 [10] public COLA;
    bytes32 [10] public PEPSI;

    bytes32 constant company_cola = "COLA";
   

    event Book(bytes32 idCompany, bytes32 resourceId, bytes32 start, bytes32 end, bytes32 idSlot);
    event Cancel(bytes32 idCompany, bytes32 resourceId, bytes32 start, bytes32 end, bytes32 idSlot);
    event SLOT(bytes32 id, bool value);

     uint256 x;
     event Done(uint256 value);

    modifier onlyWhenAvailable(bytes32 id)
    {
        require(
            slotAvailibilities[id] == false,
            "Room Not Available."
        );
        _;
    }

    modifier onlyWhenExists(bytes32 id)
        {
            require(
                availabilities[id].idSlot == 0,
                "ALREADY EXIST"
            );
            _;
        }

    modifier onlyIfExists(bytes32 id)
        {
            require(
                isAvailable[id] == false,
                "ALREADY EXIST"
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



    function book(bytes32  idCompany, bytes32  resourceId, bytes32  start, bytes32  end, bytes32 idSlot) external onlyWhenAvailable(idSlot)  {
        //make a require to check if roomID exists
        emit SLOT(idSlot, slotAvailibilities[idSlot]);
        //TODO return this onlyWhenAvailable(idSlot)

        require(colaExists[idCompany][resourceId] ==1 || pepsiExists[idCompany][resourceId] ==1, "ROOM DOES NOT EXIST");
        Slot memory slot = Slot(idSlot, 1, start, end);
        slotAvailibilities[idSlot] = true;
        rooms[resourceId].push(slot);
        emit Book(idCompany, resourceId, start, end, idSlot);


    }

    function cancel(bytes32  idCompany, bytes32  resourceId, bytes32  start, bytes32  end, bytes32  idSlot) external{
        require(colaExists[idCompany][resourceId] ==1 || pepsiExists[idCompany][resourceId] ==1);
        Slot memory slot = Slot(idSlot, 0, "", "");
        rooms[resourceId].push(slot);
        slotAvailibilities[idSlot] = false;
        emit Cancel(idCompany, resourceId, start, end, idSlot);
     }


      function test (bytes32 idCompany, bytes32 idSlot) public   {
       // emit SLOT(id, isAvailable[id]);
      //  isAvailable[id] = true;
      //   require(availabilities[idCompany].idSlot == 0,"ALREADY EXIST !!!");
         availabilities[idCompany].idCompany = idCompany;
         availabilities[idCompany].idSlot = idSlot;

      }


}