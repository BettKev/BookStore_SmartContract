const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bookstore Contract", function () {
    let bookstore;
    let owner, addr1, addr2;

    beforeEach(async () => {
        // Deploy the contract
        const Bookstore = await ethers.getContractFactory("Bookstore");
        [owner, addr1, addr2] = await ethers.getSigners();
        bookstore = await Bookstore.deploy();
        await bookstore.deployed();
    });

    it("should set the deployer as the owner", async function () {
        expect(await bookstore.owner()).to.equal(owner.address);
    });

    it("should allow the owner to add a book", async function () {
        const title = "Blockchain Basics";
        const price = ethers.utils.parseEther("1"); // 1 ETH
        const stock = 10;

        await bookstore.addBook(title, price, stock);

        const book = await bookstore.books(0);
        expect(book.title).to.equal(title);
        expect(book.price).to.equal(price);
        expect(book.stock).to.equal(stock);
    });

    it("should emit an event when a book is added", async function () {
        const title = "Blockchain Basics";
        const price = ethers.utils.parseEther("1");
        const stock = 10;

        await expect(bookstore.addBook(title, price, stock))
            .to.emit(bookstore, "BookAdded")
            .withArgs(0, title, price, stock);
    });

    it("should allow the owner to update a book", async function () {
        const title = "Blockchain Basics";
        const updatedTitle = "Advanced Blockchain";
        const price = ethers.utils.parseEther("1");
        const updatedPrice = ethers.utils.parseEther("2");
        const stock = 10;

        await bookstore.addBook(title, price, stock);
        await bookstore.updateBook(0, updatedTitle, updatedPrice, stock);

        const book = await bookstore.books(0);
        expect(book.title).to.equal(updatedTitle);
        expect(book.price).to.equal(updatedPrice);
    });

    it("should allow users to purchase a book", async function () {
        const title = "Blockchain Basics";
        const price = ethers.utils.parseEther("1");
        const stock = 10;

        await bookstore.addBook(title, price, stock);

        await bookstore.connect(addr1).purchaseBook(0, stock, { value: price });

        const book = await bookstore.books(0);
        expect(book.stock).to.equal(stock - 1);
    });

    it("should emit an event when a book is purchased", async function () {
        const title = "Blockchain Basics";
        const price = ethers.utils.parseEther("1");
        const stock = 10;

        await bookstore.addBook(title, price, stock);

        await expect(bookstore.connect(addr1).purchaseBook(0, stock, { value: price }))
            .to.emit(bookstore, "BookPurchased")
            .withArgs(0, addr1.address, price);
    });

    it("should not allow a non-owner to add books", async function () {
        const title = "Unauthorized Book";
        const price = ethers.utils.parseEther("1");
        const stock = 5;

        await expect(
            bookstore.connect(addr1).addBook(title, price, stock)
        ).to.be.revertedWith("Only the owner can perform this action");
    });

    it("should fail if a book purchase is underpaid", async function () {
        const title = "Blockchain Basics";
        const price = ethers.utils.parseEther("1");
        const stock = 10;

        await bookstore.addBook(title, price, stock);

        await expect(
            bookstore.connect(addr1).purchaseBook(0, stock, { value: ethers.utils.parseEther("0.5") })
        ).to.be.revertedWith("Insufficient payment");
    });

    it("should fail if a book is out of stock", async function () {
        const title = "Blockchain Basics";
        const price = ethers.utils.parseEther("1");
        const stock = 0;

        await bookstore.addBook(title, price, stock);

        await expect(
            bookstore.connect(addr1).purchaseBook(0, stock, { value: price })
        ).to.be.revertedWith("Book is out of stock");
    });
});
