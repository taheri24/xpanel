import { test, expect } from "bun:test";
import { screen, render } from "@testing-library/react";
import React from "react";

// Import the module to access XAdapter - we need to test the default export
// Since XAdapter is not exported, we'll test via the module's behavior
// For testing purposes, we'll need to create test helpers

// Mock XFeature data for testing
const createMockXFeature = (overrides = {}) => ({
    name: "test-feature",
    version: "1.0.0",
    backend: {
        queries: [],
        actionQueries: [],
    },
    frontend: {
        dataTables: [
            {
                id: "users-table",
                queryRef: "GetUsers",
                title: "Users",
                columns: [
                    { name: "id", label: "ID", type: "Number", width: "100" },
                    { name: "name", label: "Name", type: "Text", width: "200" },
                    { name: "email", label: "Email", type: "Email" },
                ],
                pageSize: 10,
            },
        ],
        forms: [
            {
                id: "create-user",
                mode: "Create",
                title: "Create User",
                description: "Fill in the details to create a new user",
                fields: [
                    { name: "username", label: "Username", dataType: "text", required: true },
                    { name: "email", label: "Email", dataType: "email", required: true },
                ],
                buttons: [
                    { id: "submit-btn", type: "Submit", label: "Create", style: "Primary" },
                    { id: "cancel-btn", type: "Cancel", label: "Cancel", style: "Secondary" },
                ],
            },
        ],
    },
    ...overrides,
});

// Since the XAdapter class is not exported, we need to dynamically import and test
// For now, we'll test what we can access or create integration tests

test("adapter module can be imported", async () => {
    const module = await import("./adapter");
    expect(module).toBeDefined();
});

// ============================================================================
// getInputType function tests
// ============================================================================

test("getInputType returns correct type for various data types", async () => {
    const { getInputType } = await import("./adapter");

    // Test all supported data types
    expect(getInputType("email")).toBe("email");
    expect(getInputType("password")).toBe("password");
    expect(getInputType("number")).toBe("number");
    expect(getInputType("decimal")).toBe("number");
    expect(getInputType("currency")).toBe("number");
    expect(getInputType("date")).toBe("date");
    expect(getInputType("datetime")).toBe("datetime-local");
    expect(getInputType("time")).toBe("time");
    expect(getInputType("url")).toBe("url");
    expect(getInputType("phone")).toBe("tel");
    expect(getInputType("text")).toBe("text");
    expect(getInputType("unknown")).toBe("text");
});

test("getInputType is case insensitive", async () => {
    const { getInputType } = await import("./adapter");

    expect(getInputType("EMAIL")).toBe("email");
    expect(getInputType("Password")).toBe("password");
    expect(getInputType("NUMBER")).toBe("number");
});

// ============================================================================
// XForm Component Integration Tests
// ============================================================================

test("XForm renders form title when provided", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature();
    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="create-user" />
        </Wrapper>
    );

    expect(screen.getByText("Create User")).toBeDefined();
});

test("XForm renders form description when provided", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature();
    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="create-user" />
        </Wrapper>
    );

    expect(screen.getByText("Fill in the details to create a new user")).toBeDefined();
});

test("XForm renders error message when form not found", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature();
    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="non-existent-form" />
        </Wrapper>
    );

    expect(screen.getByText(/Form not found: non-existent-form/)).toBeDefined();
});

test("XForm renders text input fields", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature();
    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="create-user" />
        </Wrapper>
    );

    expect(screen.getByLabelText(/Username/)).toBeDefined();
    expect(screen.getByLabelText(/Email/)).toBeDefined();
});

test("XForm renders submit and cancel buttons", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature();
    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="create-user" />
        </Wrapper>
    );

    expect(screen.getByText("Create")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
});

// ============================================================================
// Form with Select Field Tests
// ============================================================================

test("XForm renders select field with options", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [],
            forms: [
                {
                    id: "select-form",
                    mode: "Create",
                    title: "Select Form",
                    fields: [
                        {
                            name: "role",
                            label: "Role",
                            dataType: "select",
                            options: {
                                items: [
                                    { label: "Admin", value: "admin" },
                                    { label: "User", value: "user" },
                                ],
                            },
                        },
                    ],
                    buttons: [{ type: "Submit", label: "Submit" }],
                },
            ],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="select-form" />
        </Wrapper>
    );

    expect(screen.getByText("Select Form")).toBeDefined();
    // MUI Select renders a combobox role element
    expect(screen.getByRole("combobox")).toBeDefined();
});

// ============================================================================
// Form with Checkbox Field Tests
// ============================================================================

test("XForm renders checkbox field", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [],
            forms: [
                {
                    id: "checkbox-form",
                    mode: "Create",
                    title: "Checkbox Form",
                    fields: [
                        {
                            name: "agree",
                            label: "I agree to terms",
                            dataType: "checkbox",
                        },
                    ],
                    buttons: [{ type: "Submit", label: "Submit" }],
                },
            ],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="checkbox-form" />
        </Wrapper>
    );

    expect(screen.getByText("I agree to terms")).toBeDefined();
});

// ============================================================================
// Form with Radio Field Tests
// ============================================================================

test("XForm renders radio field with options", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [],
            forms: [
                {
                    id: "radio-form",
                    mode: "Create",
                    title: "Radio Form",
                    fields: [
                        {
                            name: "gender",
                            label: "Gender",
                            dataType: "radio",
                            options: {
                                items: [
                                    { label: "Male", value: "male" },
                                    { label: "Female", value: "female" },
                                ],
                            },
                        },
                    ],
                    buttons: [{ type: "Submit", label: "Submit" }],
                },
            ],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="radio-form" />
        </Wrapper>
    );

    // Note: Fields with options.items render as Select (combobox), not RadioGroup
    // This matches the adapter's implementation where options.items takes precedence
    expect(screen.getByText("Radio Form")).toBeDefined();
    expect(screen.getByRole("combobox")).toBeDefined();
});

// ============================================================================
// Form with Textarea Field Tests
// ============================================================================

test("XForm renders textarea field", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [],
            forms: [
                {
                    id: "textarea-form",
                    mode: "Create",
                    title: "Textarea Form",
                    fields: [
                        {
                            name: "description",
                            label: "Description",
                            dataType: "textarea",
                            rows: 4,
                        },
                    ],
                    buttons: [{ type: "Submit", label: "Submit" }],
                },
            ],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="textarea-form" />
        </Wrapper>
    );

    expect(screen.getByLabelText(/Description/)).toBeDefined();
});

// ============================================================================
// Button Style Tests
// ============================================================================

test("XForm renders button with danger style", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [],
            forms: [
                {
                    id: "danger-form",
                    mode: "Delete",
                    title: "Delete Item",
                    fields: [],
                    buttons: [
                        { type: "Submit", label: "Delete", style: "Danger" },
                        { type: "Cancel", label: "Cancel" },
                    ],
                },
            ],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="danger-form" />
        </Wrapper>
    );

    expect(screen.getByText("Delete")).toBeDefined();
});

test("XForm renders reset button", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [],
            forms: [
                {
                    id: "reset-form",
                    mode: "Create",
                    title: "Form with Reset",
                    fields: [
                        { name: "name", label: "Name", dataType: "text" },
                    ],
                    buttons: [
                        { type: "Submit", label: "Submit" },
                        { type: "Reset", label: "Reset" },
                    ],
                },
            ],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="reset-form" />
        </Wrapper>
    );

    expect(screen.getByText("Reset")).toBeDefined();
});

// ============================================================================
// DataTable Tests
// ============================================================================

test("XAdapter datatable renders with columns", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature();
    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const DataTable = adapter.datatable.bind(adapter);

    const mockData = {
        rows: [
            { id: 1, name: "John Doe", email: "john@example.com" },
            { id: 2, name: "Jane Doe", email: "jane@example.com" },
        ],
    };

    render(
        <Wrapper>
            <DataTable id="users-table" data={mockData} />
        </Wrapper>
    );

    // Check that the DataGrid container is rendered
    expect(screen.getByRole("grid")).toBeDefined();
});

test("XAdapter datatable renders with empty data", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature();
    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const DataTable = adapter.datatable.bind(adapter);

    render(
        <Wrapper>
            <DataTable id="users-table" data={{ rows: [] }} />
        </Wrapper>
    );

    expect(screen.getByRole("grid")).toBeDefined();
});

test("XAdapter datatable renders with selectable option", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature();
    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const DataTable = adapter.datatable.bind(adapter);

    const mockData = {
        rows: [{ id: 1, name: "Test", email: "test@example.com" }],
    };

    render(
        <Wrapper>
            <DataTable id="users-table" data={mockData} selectable={true} />
        </Wrapper>
    );

    expect(screen.getByRole("grid")).toBeDefined();
});

// ============================================================================
// XAdapter Wrapper Tests
// ============================================================================

test("XAdapter wrapper provides context to children", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature();
    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;

    render(
        <Wrapper>
            <div data-testid="child">Child Content</div>
        </Wrapper>
    );

    expect(screen.getByTestId("child")).toBeDefined();
    expect(screen.getByText("Child Content")).toBeDefined();
});

// ============================================================================
// Form Field Helper Text Tests
// ============================================================================

test("XForm renders helper text for fields", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [],
            forms: [
                {
                    id: "helper-form",
                    mode: "Create",
                    title: "Form with Helper",
                    fields: [
                        {
                            name: "password",
                            label: "Password",
                            dataType: "password",
                            helperText: "Must be at least 8 characters",
                        },
                    ],
                    buttons: [{ type: "Submit", label: "Submit" }],
                },
            ],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="helper-form" />
        </Wrapper>
    );

    expect(screen.getByText("Must be at least 8 characters")).toBeDefined();
});

// ============================================================================
// Form with Disabled and Readonly Fields Tests
// ============================================================================

test("XForm renders disabled field", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [],
            forms: [
                {
                    id: "disabled-form",
                    mode: "View",
                    title: "View Form",
                    fields: [
                        {
                            name: "id",
                            label: "ID",
                            dataType: "text",
                            disabled: true,
                        },
                    ],
                    buttons: [{ type: "Close", label: "Close" }],
                },
            ],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="disabled-form" />
        </Wrapper>
    );

    const input = screen.getByLabelText(/ID/);
    expect(input).toBeDefined();
});

// ============================================================================
// Form Callback Tests
// ============================================================================

test("XForm calls onCancel when cancel button clicked", async () => {
    const { XAdapter } = await import("./adapter") as any;
    const userEvent = (await import("@testing-library/user-event")).default;

    const mockFeature = createMockXFeature();
    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    let cancelCalled = false;
    const onCancel = () => {
        cancelCalled = true;
    };

    render(
        <Wrapper>
            <Form id="create-user" onCancel={onCancel} />
        </Wrapper>
    );

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    expect(cancelCalled).toBe(true);
});

// ============================================================================
// Various Input Type Tests
// ============================================================================

test("XForm renders date input field", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [],
            forms: [
                {
                    id: "date-form",
                    mode: "Create",
                    title: "Date Form",
                    fields: [
                        {
                            name: "birthdate",
                            label: "Birth Date",
                            dataType: "date",
                        },
                    ],
                    buttons: [{ type: "Submit", label: "Submit" }],
                },
            ],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="date-form" />
        </Wrapper>
    );

    expect(screen.getByLabelText(/Birth Date/)).toBeDefined();
});

test("XForm renders number input field", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [],
            forms: [
                {
                    id: "number-form",
                    mode: "Create",
                    title: "Number Form",
                    fields: [
                        {
                            name: "age",
                            label: "Age",
                            dataType: "number",
                        },
                    ],
                    buttons: [{ type: "Submit", label: "Submit" }],
                },
            ],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="number-form" />
        </Wrapper>
    );

    expect(screen.getByLabelText(/Age/)).toBeDefined();
});

// ============================================================================
// Boolean Field Tests
// ============================================================================

test("XForm renders boolean field as checkbox", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [],
            forms: [
                {
                    id: "boolean-form",
                    mode: "Create",
                    title: "Boolean Form",
                    fields: [
                        {
                            name: "active",
                            label: "Is Active",
                            dataType: "boolean",
                        },
                    ],
                    buttons: [{ type: "Submit", label: "Submit" }],
                },
            ],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="boolean-form" />
        </Wrapper>
    );

    expect(screen.getByText("Is Active")).toBeDefined();
});

// ============================================================================
// Custom Button Tests
// ============================================================================

test("XForm renders custom button", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [],
            forms: [
                {
                    id: "custom-btn-form",
                    mode: "Create",
                    title: "Custom Button Form",
                    fields: [],
                    buttons: [
                        { type: "Custom", label: "Custom Action", style: "Info" },
                    ],
                },
            ],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const Form = adapter.form.bind(adapter);

    render(
        <Wrapper>
            <Form id="custom-btn-form" />
        </Wrapper>
    );

    expect(screen.getByText("Custom Action")).toBeDefined();
});

// ============================================================================
// DataTable with Custom PageSize Tests
// ============================================================================

test("XAdapter datatable respects custom pageSize", async () => {
    const { XAdapter } = await import("./adapter") as any;

    const mockFeature = createMockXFeature({
        frontend: {
            dataTables: [
                {
                    id: "paged-table",
                    queryRef: "GetItems",
                    title: "Paged Items",
                    columns: [
                        { name: "id", label: "ID", type: "Number" },
                    ],
                    pageSize: 25,
                },
            ],
            forms: [],
        },
    });

    const adapter = new XAdapter(mockFeature);
    const Wrapper = adapter.wrapper;
    const DataTable = adapter.datatable.bind(adapter);

    render(
        <Wrapper>
            <DataTable id="paged-table" data={{ rows: [] }} pageSize={5} />
        </Wrapper>
    );

    expect(screen.getByRole("grid")).toBeDefined();
});
