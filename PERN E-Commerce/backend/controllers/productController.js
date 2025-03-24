import { sql } from "../config/db.js";

//CRUD OPERATIONS


export const getProducts = async (req,res) => {
    try { const products = await sql `
        select * from products
        order by created_at DESC
    `;

    console.log("fetched products", products);
    res.status(200).json({success:true,data:products});
    } catch (error){
        console.log("Error GetProducts", error);
        res.status(500).json({success:false, message:"Internal Server Error."});
    }
};

export const createProduct = async (req,res) => {
    const {name,price,image} =  req.body;
    if (!name || !price || !image){
        return res.status(400).json({success:false,message:"All fields are required."});
    };
    try {
        const newProduct = await sql `
            INSERT INTO products (name, price, image)
            VALUES (${name},${price}, ${image})
            RETURNING *
        `
        console.log("new product added:", newProduct);
        res.status(201).json({success:true, data:newProduct[0]});

    } catch (error) {
        console.log("Error in CreateProduct", error);
        res.status(500).json({success:false, message:"Internal Server Error."});
    }
};

export const getProduct = async (req,res) => {
    const {id} = req.params;
    try {
        const product = await sql `
            SELECT * FROM products where id = ${ id };
        `
        res.status(200).json({success:true, data: product[0]});

    } catch (error){
        console.log("Error in getProduct", error);
        res.status(500).json({success:false, message:"Internal Server Error."})
    }
};

export const updateProduct = async (req,res) => {
    const { id } = req.params;
    const { name,price, image} = req.body;


    try {
        const updateProduct = await sql`
            UPDATE products  SET name = ${name}, price = ${price}, image = ${image} where id = ${id} RETURNING *
        `
        
        if (updateProduct.length === 0){
            res.status(404).json({success:false, message:"Product not found."});
        } else{
            res.status(200).json({success:true, data: updateProduct[0]});
        };
        
    } catch(error){
        console.log("Error in updateProduct", error);
        res.status(500).json({success:false, message:"Internal Server Error."})

    }
};
export const deleteProduct = async (req,res) => {
    const { id } = req.params;



    try {
        const deleteProduct = await sql`
            delete from products where id = ${id} returning *
        `
        
        if (deleteProduct.length === 0){
            res.status(404).json({success:false, message:"Product not found."});
        } else{
            res.status(200).json({success:true, data: deleteProduct[0]});
        };
        
    } catch(error){
        console.log("Error in deleteProduct", error);
        res.status(500).json({success:false, message:"Internal Server Error."})

    }
};