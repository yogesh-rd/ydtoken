// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

contract YDToken {
	address public admin = msg.sender;
	uint8 public decimals = 18;
	uint256 public totalSupply = 1000 * 10 ** decimals;

	mapping (address => uint256) private _balances;
	mapping (address => mapping(address => uint256)) private _allowed;

	event Transfer (address indexed _from, address indexed _to, uint256 _value);
	event Approval (address indexed _owner, address indexed _spender, uint256 _value);
	event Burn (address indexed _account, uint256 _value);
	event Mint (address indexed _account, uint256 _value);

	constructor () {
		_balances[msg.sender] = 1000 * 10 ** decimals;
	}

	function name () public pure returns (string memory) {
		return "YDToken";
	}

	function symbol () public pure returns (string memory) {
		return "YDT";
	}

	function balanceOf (address _owner) public view returns (uint256) {
		return _balances[_owner];
	}

	function transfer (address _to, uint256 _value) public returns (bool) {
		require(_value <= _balances[msg.sender], "Insufficient balance");

		_balances[msg.sender] = _balances[msg.sender] - _value;
		_balances[_to] = _balances[_to] + _value;
		emit Transfer(msg.sender, _to, _value);

		return true;
	}

	function transferFrom (address _from, address _to, uint _value) public returns (bool) {
		require(_value <= _allowed[_from][msg.sender], "Not allowed");
		require(_value <= _balances[_from], "Insufficient balance");

		_balances[_from] = _balances[_from] - _value;
		_balances[_to] = _balances[_to] + _value;
		_allowed[_from][msg.sender] = _allowed[_from][msg.sender] - _value;
		emit Transfer(_from, _to, _value);

		return true;
	}

	function approve (address _spender, uint256 _value) public returns (bool) {
		_allowed[msg.sender][_spender] = _value;
		emit Approval(msg.sender, _spender, _value);

		return true;
	}

	function allowance (address _owner, address _spender) public view returns (uint256) {
		return _allowed[_owner][_spender];
	}

	function increaseAllowance (address _spender, uint256 _value) public returns (bool) {
		_allowed[msg.sender][_spender] = _allowed[msg.sender][_spender] + _value;
		emit Approval (msg.sender, _spender, _allowed[msg.sender][_spender]);
		
		return true;
	}

	function decreaseAllowance (address _spender, uint256 _value) public returns (bool) {
		require(_value <= _allowed[msg.sender][_spender], "Allownace can't be made negative");

		_allowed[msg.sender][_spender] = _allowed[msg.sender][_spender] - _value;
		emit Approval (msg.sender, _spender, _allowed[msg.sender][_spender]);

		return true;
	}

	function burn (uint256 _value) public returns (bool) {
		require(_value <= _balances[msg.sender], "Insufficient balance");

		totalSupply = totalSupply - _value;
		_balances[msg.sender] = _balances[msg.sender] - _value;
		emit Burn(msg.sender, _value);

		return true;
	}

	function burnFrom (address _from, uint256 _value) public returns (bool) {
		require(_value <= _allowed[_from][msg.sender], "Not allowed");
		require(_value <= _balances[_from], "Insufficient balance");

		totalSupply = totalSupply - _value;
		_balances[_from] = _balances[_from] - _value;
		emit Burn(_from, _value);

		return true;
	}

	function mint (address _to, uint256 _value) public returns (bool) {
		require(msg.sender == admin, "Only admin can mint coins");
		totalSupply = totalSupply + _value;
		_balances[_to] = _balances[_to] + _value;
		emit Mint (_to, _value);

		return true;
	}
}