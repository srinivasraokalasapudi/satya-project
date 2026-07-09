import React,{useEffect} from 'react';
const Customers=()=>{useEffect(()=>{document.title='Satya POS | Customers';},[]);
return <div className='min-h-screen bg-[#1f1f1f] p-6 text-white'><h1 className='text-3xl font-bold'>Customers</h1><p className='text-gray-400 mt-2'>Customer database and loyalty management.</p><div className='mt-8 bg-[#262626] rounded-xl p-6'>Display customer list, search, visit count and spending.</div></div>}
export default Customers;