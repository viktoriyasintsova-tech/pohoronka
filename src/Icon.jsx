import React from 'react';
export default function Icon({name,size=20,className='',label,...props}){return <i aria-hidden={label?undefined:'true'} role={label?'img':undefined} aria-label={label} className={`fi-rr-${name} ui-icon ${className}`} style={{'--icon-size':`${size}px`}} {...props}/>}
