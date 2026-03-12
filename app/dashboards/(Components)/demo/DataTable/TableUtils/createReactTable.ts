import { useReactTable } from '@tanstack/react-table'
import React, { useState } from 'react'
import { createColumnsFactory } from '../TableColumns/ColumnsFactory'
import { Applicant, pagination } from '@/utils/schema'
import { useReactTableUtils } from './useReactTableUtils'
type createReactTableProps = {
    
        Applicants: Applicant[],
        pagination: pagination
    
}
export const createReactTable = ({ Applicants,pagination }: createReactTableProps) => {
    const {getters,on,states,values}=useReactTableUtils()   
    return useReactTable<Applicant>({
        data: [Applicants[]],
        columns: createColumnsFactory(),
        state: {...states()},
        ...getters(),
        ...on(),
        ...values(),
    })
}
