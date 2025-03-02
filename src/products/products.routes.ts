import express, { Request, Response } from "express";
import { Product, UnitProduct } from "./product.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./products.database";

export const productRouter = express.Router();

// Get all products
productRouter.get("/products", async (req: Request, res: Response) => {
    try {
        const allProducts: UnitProduct[] = await database.findAll();

        if (!allProducts || allProducts.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "No products found!" });
        }

        return res.status(StatusCodes.OK).json({ total: allProducts.length, allProducts });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
});

// Get product by ID
productRouter.get("/product/:id", async (req: Request, res: Response) => {
    try {
        const product: UnitProduct | null = await database.findOne(req.params.id);

        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "Product does not exist" });
        }

        return res.status(StatusCodes.OK).json({ product });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
});

// Create a new product
productRouter.post("/product", async (req: Request, res: Response) => {
    try {
        const { name, price, quantity, image } = req.body;

        if (!name || !price || !quantity || !image) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters." });
        }

        const newProduct = await database.create({ ...req.body });

        if (!newProduct) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to create product." });
        }

        return res.status(StatusCodes.CREATED).json({ newProduct });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
});

// Update product by ID
productRouter.put("/product/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const newProductData = req.body;

        const existingProduct: UnitProduct | null = await database.findOne(id);

        if (!existingProduct) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "Product does not exist." });
        }

        const updatedProduct = await database.update(id, newProductData);

        return res.status(StatusCodes.OK).json({ msg: "Product updated successfully", updatedProduct });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
});

// Delete product by ID
productRouter.delete("/product/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const existingProduct: UnitProduct | null = await database.findOne(id);

        if (!existingProduct) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `No product found with ID ${id}` });
        }

        await database.remove(id);

        return res.status(StatusCodes.OK).json({ msg: "Product deleted successfully." });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message });
    }
});
