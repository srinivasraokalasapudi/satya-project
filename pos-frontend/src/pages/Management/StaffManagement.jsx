import React,{useEffect} from 'react';
const StaffManagement=()=>{useEffect(()=>{document.title='Satya POS | Staff';},[]);
return <div className='min-h-screen bg-[#1f1f1f] p-6 text-white'><h1 className='text-3xl font-bold'>Staff Management</h1><p className='text-gray-400 mt-2'>Manage employees, roles and attendance.</p><div className='mt-8 bg-[#262626] rounded-xl p-6'>Implement employee CRUD, attendance, salary and role management here.</div></div>}
export default StaffManagement;