const Customer = require("../models/customerModel");

exports.getCustomers = async (req, res) => {

    const customers = await Customer.find()

    .sort({createdAt:-1});

    res.json({

        success:true,

        data:customers

    });

};

exports.getCustomer = async(req,res)=>{

    const customer=await Customer.findById(req.params.id);

    res.json({

        success:true,

        data:customer

    });

};

exports.createCustomer=async(req,res)=>{

    const customer=await Customer.create(req.body);

    res.status(201).json({

        success:true,

        data:customer

    });

};

exports.updateCustomer=async(req,res)=>{

    const customer=await Customer.findByIdAndUpdate(

        req.params.id,

        req.body,

        {

            new:true

        }

    );

    res.json({

        success:true,

        data:customer

    });

};

exports.deleteCustomer=async(req,res)=>{

    await Customer.findByIdAndDelete(req.params.id);

    res.json({

        success:true

    });

};