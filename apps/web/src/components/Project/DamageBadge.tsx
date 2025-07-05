import { Badge } from '@components/ui/badge';
import { LossType } from '@service-geek/api-client';
import { AlertTriangle } from 'lucide-react';
import React from 'react'

const DAMAGE_TYPES = [
    { value: LossType.FIRE, label: "Fire", color: "red" },
    { value: LossType.WATER, label: "Water", color: "blue" },
    { value: LossType.WIND, label: "Wind", color: "green" },
    { value: LossType.HAIL, label: "Hail", color: "orange" },
    { value: LossType.MOLD, label: "Mold", color: "gray" },
    { value: LossType.OTHER, label: "Other", color: "purple" },
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