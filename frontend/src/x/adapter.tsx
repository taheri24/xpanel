import React, { use, useContext } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import type { XFeature } from "../types/xfeature";
class XAdapter{
    model:XFeature;
    constructor( model:XFeature){
        this.model=model;
        this.wrapper=this.wrapper.bind(this);
    }

    wrapper(p:wrapperProps):React.ReactNode{ 
        return <context.Provider value={this}>
            {p.children}
        </context.Provider>
    }
    form(p:formProps){
        const {model}=useContext(context);
        const desiredForm= model.frontend.forms.find(f=>f.id==p.id);
        // FIXME: Return a form with pairing tanstack-form and the desired form
        return  <></>
    }
    datatable(p: dataTableProps & { id: string }) {
        // Extend the DataTable type with additional properties we need
        type ExtendedDataTable = typeof p & {
            data?: {
                rows: any[];
            };
            pageSize?: number;
            selectable?: boolean;
        };
        const adap=useContext(context);// replacement of this  
        const dt = adap.model.frontend.dataTables.find(t => t.id == p.id)  ;
         
        const columns: GridColDef[] = dt?.columns?.map(column => ({
            field: column.name,
            headerName: column.label || column.name,
            width: column.width ? parseInt(column.width) : 150,
            sortable: column.sortable !== false,
            filterable: column.filterable !== false,
            align: column.align || 'left',
            headerAlign: column.align || 'left',
        })) || [];

        const rows = dt?.data?.rows || [];
        const paginationModel = {
            page: 0,
            pageSize: dt?.pageSize || 10,
        };

        return (
            <div style={{ height: 400, width: '100%', minWidth: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{ 
                        pagination: { paginationModel } 
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    checkboxSelection={dt?.selectable}
                    disableRowSelectionOnClick
                    sx={{ border: 0 }}
                />
            </div>
        ) 
    }
}
interface wrapperProps{
    children:React.ReactNode;
}
interface dataTableProps {
    id: string;
    data?: {
        rows: any[];
    };
    pageSize?: number;
    selectable?: boolean;
}
interface formProps{
    id:string;
}
const context=React.createContext<XAdapter>(null as unknown as XAdapter)
 