// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Bookstore {
    struct Book {
        string title;
        uint price; // Price in wei
        uint stock;
    }

    address public owner;
    uint public bookCount = 0;

    mapping(uint => Book) public books;

    // Events
    event BookAdded(uint bookId, string title, uint price, uint stock);
    event BookUpdated(uint bookId, string title, uint price, uint stock);
    event BookPurchased(uint bookId, address buyer, uint amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender; // Set the deployer as the owner
    }

    function addBook(string memory _title, uint _price, uint _stock) public onlyOwner {
        require(_price > 0, "Price must be greater than zero");
        require(_stock > 0, "Stock must be greater than zero");

        books[bookCount] = Book(_title, _price, _stock);
        emit BookAdded(bookCount, _title, _price, _stock);
        bookCount++;
    }

    function updateBook(uint _bookId, string memory _title, uint _price, uint _stock) public onlyOwner {
        require(_bookId < bookCount, "Book does not exist");
        require(_price > 0, "Price must be greater than zero");
        require(_stock >= 0, "Stock cannot be negative");

        books[_bookId] = Book(_title, _price, _stock);
        emit BookUpdated(_bookId, _title, _price, _stock);
    }

    function purchaseBook(uint _bookId, uint _amount) public payable {
        require(_bookId < bookCount, "Book does not exist");
        Book storage book = books[_bookId];

        require(book.stock > 0, "Book is out of stock");
        require(msg.value >= book.price, "Insufficient payment");
        require(_amount == book.price * book.stock, "Incorrect payment amount.");

        book.stock--;
        payable(owner).transfer(msg.value);

        emit BookPurchased(_bookId, msg.sender, msg.value);
    }

    function checkStock(uint _bookId) public view returns (uint) {
        require(_bookId < bookCount, "Book does not exist");
        return books[_bookId].stock;
    }
}
