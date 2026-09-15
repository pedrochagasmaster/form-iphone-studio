import * as Switch from '@radix-ui/react-switch';
import {useId} from 'react';
export default function Toggle({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void}){const id=useId();return <div className="toggleControl"><label htmlFor={id}>{label}</label><Switch.Root className="switch" id={id} checked={value} onCheckedChange={onChange}><Switch.Thumb className="switchThumb"/></Switch.Root></div>}
