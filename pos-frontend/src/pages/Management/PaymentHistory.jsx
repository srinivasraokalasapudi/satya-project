import React,{useEffect} from 'react';
const PaymentHistory=()=>{useEffect(()=>{document.title='Satya POS | Payment History';},[]);
return <div className='min-h-screen bg-[#1f1f1f] p-6 text-white'><h1 className='text-3xl font-bold'>Payment History</h1><p className='text-gray-400 mt-2'>View all payment transactions.</p><div className='mt-8 bg-[#262626] rounded-xl p-6'>Connect this page to getPayments() to show transaction history.</div></div>}
export default PaymentHistory;