import { Badge } from '@components/ui/badge';
import { LossType } from '@service-geek/api-client';
import { AlertTriangle } from 'lucide-react';
import React from 'react'

const DAMAGE_TYPES = [
    { value: LossType.FIRE, label: "Fire", color: "#e74c3c" },
    { value: LossType.WATER, label: "Water", color: "#3498db" },
    { value: LossType.WIND, label: "Wind", color: "#95a5a6" },
    { value: LossType.HAIL, label: "Hail", color: "#9b59b6" },
    { value: LossType.MOLD, label: "Mold", color: "#27ae60" },
    { value: LossType.OTHER, label: "Other", color: "#f39c12" },
] as const;

const DamageBadge = ({ lossType }: { lossType: LossType }) => {
    return (
        <Badge
            variant='outline'
            className={`text-xs`}
            style={{
                borderColor: DAMAGE_TYPES.find(type => type.value === lossType)?.color,
                backgroundColor: DAMAGE_TYPES.find(type => type.value === lossType)?.color,
                color: "white",
            }}
        >
            <AlertTriangle className='mr-1 h-3 w-3' />
            {DAMAGE_TYPES.find(type => type.value === lossType)?.label}
        </Badge>
    )
}

export default DamageBadge