// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoApp {
    event NewTodoItem(uint256 id, string name, bool isCompleted);
    event ToggleTodoItem(uint256 id, bool isCompleted);

    struct TodoItem {
        string name;
        uint256 id;
        bool isCompleted;
    }

    TodoItem[] public todoStore;
    mapping(uint256 => address) public todoToOwner;
    mapping(address => uint256) public ownerTodoCount;

    function _createTodoItem(string memory _name, bool _isCompleted) internal {
        uint256 id = todoStore.length;
        todoStore.push(TodoItem(_name, id, _isCompleted));
        todoToOwner[id] = msg.sender;
        ownerTodoCount[msg.sender]++;
        emit NewTodoItem(id, _name, _isCompleted);
    }

    function createNewTodo(string memory _name) external {
        _createTodoItem(_name, false);
    }

    function getTodoByOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory result = new uint256[](ownerTodoCount[_owner]);
        uint256 counter = 0;
        for (uint256 i = 0; i < todoStore.length; i++) {
            if (todoToOwner[i] == _owner) {
                result[counter] = i;
                counter++;
            }
        }
        return result;
    }

    function getMyTodo() external view returns (uint256[] memory) {
        return getTodoByOwner(msg.sender);
    }

    modifier onlyOwnerOf(uint256 _id) {
        require(msg.sender == todoToOwner[_id]);
        _;
    }

    function _setTodoState(uint256 _id, bool _isCompleted) internal {
        todoStore[_id].isCompleted = _isCompleted;
        emit ToggleTodoItem(_id, _isCompleted);
    }

    function toggleTodo(uint256 _id) external onlyOwnerOf(_id) {
        _setTodoState(_id, !todoStore[_id].isCompleted);
    }
}
