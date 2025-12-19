import React, { useContext } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import type { XFeature, Mapping, Button as FormButton } from "../types/xfeature";
import { useForm } from "@tanstack/react-form";
import {
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    Checkbox,
    FormControlLabel,
    Radio,
    RadioGroup,
    Button,
    Box,
    Typography,
} from "@mui/material";
export class XAdapter{
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
    form(p: formProps) {
        const { model } = useContext(context);
        const desiredForm = model.frontend.forms.find(f => f.id == p.id);

        if (!desiredForm) {
            return <Typography color="error">Form not found: {p.id}</Typography>;
        }

        return <XForm definition={desiredForm} onSubmit={p.onSubmit} onCancel={p.onCancel} />;
    }
    datatable(p: dataTableProps & { id: string }) {
        const adap = useContext(context);
        const dt = adap.model.frontend.dataTables.find(t => t.id == p.id);

        const columns: GridColDef[] = dt?.columns?.map(column => ({
            field: column.name,
            headerName: column.label || column.name,
            width: column.width ? parseInt(column.width) : 150,
            sortable: column.sortable !== false,
            filterable: column.filterable !== false,
            align: column.align || 'left',
            headerAlign: column.align || 'left',
        })) || [];

        const rows = p.data?.rows || [];
        const paginationModel = {
            page: 0,
            pageSize: dt?.pageSize || p.pageSize || 10,
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
                    checkboxSelection={p.selectable}
                    disableRowSelectionOnClick
                    sx={{ border: 0 }}
                />
            </div>
        );
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
interface formProps {
    id: string;
    onSubmit?: (values: Record<string, unknown>) => void;
    onCancel?: () => void;
}
const context = React.createContext<XAdapter>(null as unknown as XAdapter);

// XForm component using TanStack Form
interface XFormProps {
    definition: {
        id: string;
        mode: string;
        title?: string;
        description?: string;
        fields: Mapping[];
        buttons: FormButton[];
    };
    onSubmit?: (values: Record<string, unknown>) => void;
    onCancel?: () => void;
}

function XForm({ definition, onSubmit, onCancel }: XFormProps) {
    const defaultValues: Record<string, unknown> = {};
    definition.fields.forEach(field => {
        defaultValues[field.name] = '';
    });

    const form = useForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            onSubmit?.(value);
        },
    });

    const renderField = (field: Mapping) => {
        const dataType = field.dataType?.toLowerCase() || 'text';

        // Handle Select/Dropdown fields
        if (dataType === 'select' || field.options?.items) {
            return (
                <form.Field key={field.name} name={field.name}>
                    {(fieldApi) => (
                        <FormControl
                            fullWidth
                            margin="normal"
                            required={field.required}
                            disabled={field.disabled || field.readonly}
                            error={fieldApi.state.meta.errors.length > 0}
                        >
                            <InputLabel>{field.label}</InputLabel>
                            <Select
                                value={fieldApi.state.value as string}
                                onChange={(e) => fieldApi.handleChange(e.target.value)}
                                onBlur={fieldApi.handleBlur}
                                label={field.label}
                            >
                                {field.options?.items?.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {field.helperText && <FormHelperText>{field.helperText}</FormHelperText>}
                            {fieldApi.state.meta.errors.length > 0 && (
                                <FormHelperText error>{fieldApi.state.meta.errors.join(', ')}</FormHelperText>
                            )}
                        </FormControl>
                    )}
                </form.Field>
            );
        }

        // Handle Checkbox fields
        if (dataType === 'checkbox' || dataType === 'boolean') {
            return (
                <form.Field key={field.name} name={field.name}>
                    {(fieldApi) => (
                        <FormControl
                            margin="normal"
                            disabled={field.disabled || field.readonly}
                            error={fieldApi.state.meta.errors.length > 0}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={!!fieldApi.state.value}
                                        onChange={(e) => fieldApi.handleChange(e.target.checked)}
                                        onBlur={fieldApi.handleBlur}
                                    />
                                }
                                label={field.label}
                            />
                            {field.helperText && <FormHelperText>{field.helperText}</FormHelperText>}
                        </FormControl>
                    )}
                </form.Field>
            );
        }

        // Handle Radio fields
        if (dataType === 'radio') {
            return (
                <form.Field key={field.name} name={field.name}>
                    {(fieldApi) => (
                        <FormControl
                            margin="normal"
                            required={field.required}
                            disabled={field.disabled || field.readonly}
                            error={fieldApi.state.meta.errors.length > 0}
                        >
                            <Typography variant="body2" color="textSecondary">{field.label}</Typography>
                            <RadioGroup
                                value={fieldApi.state.value as string}
                                onChange={(e) => fieldApi.handleChange(e.target.value)}
                            >
                                {field.options?.items?.map(opt => (
                                    <FormControlLabel
                                        key={opt.value}
                                        value={opt.value}
                                        control={<Radio />}
                                        label={opt.label}
                                    />
                                ))}
                            </RadioGroup>
                            {field.helperText && <FormHelperText>{field.helperText}</FormHelperText>}
                        </FormControl>
                    )}
                </form.Field>
            );
        }

        // Handle Textarea fields
        if (dataType === 'textarea' || (field.rows && field.rows > 1)) {
            return (
                <form.Field key={field.name} name={field.name}>
                    {(fieldApi) => (
                        <TextField
                            fullWidth
                            margin="normal"
                            label={field.label}
                            placeholder={field.placeholder}
                            required={field.required}
                            disabled={field.disabled}
                            InputProps={{ readOnly: field.readonly }}
                            helperText={fieldApi.state.meta.errors.length > 0
                                ? fieldApi.state.meta.errors.join(', ')
                                : field.helperText}
                            error={fieldApi.state.meta.errors.length > 0}
                            multiline
                            rows={field.rows || 4}
                            value={fieldApi.state.value as string}
                            onChange={(e) => fieldApi.handleChange(e.target.value)}
                            onBlur={fieldApi.handleBlur}
                        />
                    )}
                </form.Field>
            );
        }

        // Default: Text-based fields (text, email, password, number, date, etc.)
        const inputType = getInputType(dataType);
        return (
            <form.Field key={field.name} name={field.name}>
                {(fieldApi) => (
                    <TextField
                        fullWidth
                        margin="normal"
                        type={inputType}
                        label={field.label}
                        placeholder={field.placeholder}
                        required={field.required}
                        disabled={field.disabled}
                        InputProps={{ readOnly: field.readonly }}
                        helperText={fieldApi.state.meta.errors.length > 0
                            ? fieldApi.state.meta.errors.join(', ')
                            : field.helperText}
                        error={fieldApi.state.meta.errors.length > 0}
                        value={fieldApi.state.value as string}
                        onChange={(e) => fieldApi.handleChange(e.target.value)}
                        onBlur={fieldApi.handleBlur}
                    />
                )}
            </form.Field>
        );
    };

    const renderButton = (button: FormButton, index: number) => {
        const variant = button.style === 'Primary' ? 'contained'
            : button.style === 'Secondary' ? 'outlined'
                : 'text';

        const color = button.style === 'Danger' ? 'error'
            : button.style === 'Success' ? 'success'
                : button.style === 'Warning' ? 'warning'
                    : button.style === 'Info' ? 'info'
                        : 'primary';

        if (button.type === 'Submit') {
            return (
                <form.Subscribe key={button.id || index} selector={(state) => state.isSubmitting}>
                    {(isSubmitting) => (
                        <Button
                            type="submit"
                            variant={variant}
                            color={color}
                            disabled={button.disabled || isSubmitting}
                        >
                            {button.label || 'Submit'}
                        </Button>
                    )}
                </form.Subscribe>
            );
        }

        if (button.type === 'Cancel' || button.type === 'Close') {
            return (
                <Button
                    key={button.id || index}
                    type="button"
                    variant={variant}
                    color={color}
                    disabled={button.disabled}
                    onClick={onCancel}
                >
                    {button.label || button.type}
                </Button>
            );
        }

        if (button.type === 'Reset') {
            return (
                <Button
                    key={button.id || index}
                    type="button"
                    variant={variant}
                    color={color}
                    disabled={button.disabled}
                    onClick={() => form.reset()}
                >
                    {button.label || 'Reset'}
                </Button>
            );
        }

        return (
            <Button
                key={button.id || index}
                type="button"
                variant={variant}
                color={color}
                disabled={button.disabled}
                onClick={button.onClick}
            >
                {button.label || 'Button'}
            </Button>
        );
    };

    return (
        <Box component="form" onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
            {definition.title && (
                <Typography variant="h6" gutterBottom>{definition.title}</Typography>
            )}
            {definition.description && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    {definition.description}
                </Typography>
            )}

            {definition.fields.map(renderField)}

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                {definition.buttons.map(renderButton)}
            </Box>
        </Box>
    );
}

export function getInputType(dataType: string): string {
    switch (dataType.toLowerCase()) {
        case 'email': return 'email';
        case 'password': return 'password';
        case 'number':
        case 'decimal':
        case 'currency': return 'number';
        case 'date': return 'date';
        case 'datetime': return 'datetime-local';
        case 'time': return 'time';
        case 'url': return 'url';
        case 'phone': return 'tel';
        default: return 'text';
    }
}
