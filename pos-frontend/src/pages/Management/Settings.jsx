import React,{useEffect} from 'react';
const Settings=()=>{useEffect(()=>{document.title='Satya POS | Settings';},[]);
return <div className='min-h-screen bg-[#1f1f1f] p-6 text-white'><h1 className='text-3xl font-bold'>Settings</h1><p className='text-gray-400 mt-2'>Configure hotel information and POS settings.</p><div className='mt-8 bg-[#262626] rounded-xl p-6'>Add hotel info, GST, printer, theme, backup and restore settings here.</div></div>}
export default Settings;