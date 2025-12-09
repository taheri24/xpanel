import React, { useContext } from "react";
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
    datatable(p:dataTableProps){
        const adap=useContext(context);// replacement of this  
        const dt=adap.model.frontend.dataTables.find(t=>t.id==p.id);
         
        const columns:Array<GridColDef>=[]; // TODO : convert dt?.columns to GridColDef[] with using `map`

          
        // TODO: Hey AI, USE : https://mui.com/material-ui/react-table/
        /* TODO: follows this code 
        <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0 }}
      />

        */ 
        return <></> 
    }
}
interface wrapperProps{
    children:React.ReactNode;
}
interface dataTableProps{
    id:string;

}
const context=React.createContext<XAdapter>(null as unknown as XAdapter)
 