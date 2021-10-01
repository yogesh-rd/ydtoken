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

	constructor () {
		_balances[msg.sender] = 1000 * 10 ** decimals;
	}

	function _transfer (address _from, address _to, uint256 _value) internal {
		require(_from != address(0), "ERC20: transfer from the zero address");
		require(_to != address(0), "ERC20: transfer to the zero address");
		require(_value <= _balances[_from], "ERC20: transfer amount exceeds balance");

		_balances[_from] = _balances[_from] - _value;
		_balances[_to] = _balances[_to] + _value;
		emit Transfer(_from, _to, _value);
	}

	function _burn (address _from, uint256 _value) internal {
		require(_from != address(0), "ERC20: burn from the zero address");
		require(_value <= _balances[_from], "ERC20: burn amount exceeds balance");

		_balances[_from] = _balances[_from] - _value;
		totalSupply = totalSupply - _value;
		emit Transfer(_from, address(0), _value);
	}

	function _mint (address _to, uint256 _value) internal {
		require(_to != address(0), "ERC20: mint to the zero address");

		totalSupply = totalSupply + _value;
		_balances[_to] = _balances[_to] + _value;
		emit Transfer(address(0), _to, _value);
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
		_transfer(msg.sender, _to, _value);

		return true;
	}

	function transferFrom (address _from, address _to, uint _value) public returns (bool) {
		require(_value <= _allowed[_from][msg.sender], "Not allowed");

		_transfer(_from, _to, _value);
		_allowed[_from][msg.sender] = _allowed[_from][msg.sender] - _value;

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
		_burn(msg.sender, _value);

		return true;
	}

	function burnFrom (address _from, uint256 _value) public returns (bool) {
		require(_value <= _allowed[_from][msg.sender], "Not allowed");
		
		_burn(_from, _value);

		return true;
	}

	function mint (address _to, uint256 _value) public returns (bool) {
		require(msg.sender == admin, "Only admin can mint coins");
		
		_mint(_to, _value);

		return true;
	}
}