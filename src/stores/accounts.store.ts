import { defineStore } from "pinia";
import { reactive, computed } from "vue";

export type Tag = { text: string };

export enum RecordTypes {
  LDAP = "LDAP",
  Локальная = "Локальная",
}

export interface Account {
  tag: Tag[];
  recordType: RecordTypes;
  login: string;
  password: string | null;
}

export interface AccountRow {
  id: string;
  tagString: string;
  recordType: RecordTypes;
  login: string;
  password: string | null;
}

interface State {
  accounts: Account[];      // данные для хранения
  formRows: AccountRow[];   // данные для формы/таблицы
}

export const useAccountsStore = defineStore("accounts", () => {
  const state = reactive<State>({
    accounts: JSON.parse(localStorage.getItem("accounts") || "[]"),
    formRows: [],
  });

  const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

  const toRow = (acc: Account): AccountRow => ({
    id: uid(),
    tagString: acc.tag.map(t => t.text).join("; "),
    recordType: acc.recordType,
    login: acc.login,
    password: acc.password,
  });

  const toAccount = (row: AccountRow): Account => ({
    tag: row.tagString
      .split(";")
      .map(t => t.trim())
      .filter(Boolean)
      .map(text => ({ text })),
    recordType: row.recordType,
    login: row.login.trim(),
    password: row.recordType === RecordTypes.LDAP ? null : (row.password ?? ""),
  });

  function hydrate() {
    state.formRows = state.accounts.map(toRow);
  }

  function save() {
    localStorage.setItem("accounts", JSON.stringify(state.accounts));
  }

  function persistRow(index: number) {
    state.accounts[index] = toAccount(state.formRows[index]);
    save();
  }

  function addAccount() {
    const row: AccountRow = {
      id: uid(),
      tagString: "",
      recordType: RecordTypes.LDAP,
      login: "",
      password: null,
    };
    state.formRows.push(row);
    state.accounts.push(toAccount(row));
    save();
  }

  function removeAccount(index: number) {
    state.formRows.splice(index, 1);
    state.accounts.splice(index, 1);
    save();
  }

  function onRecordTypeChange(index: number, value: RecordTypes) {
    const row = state.formRows[index];
    row.recordType = value;
    if (value === RecordTypes.LDAP) {
      row.password = null;
    }
    persistRow(index);
  }

  async function saveField(
    index: number,
    field: keyof AccountRow,
    formRef: import("ant-design-vue").FormInstance | undefined
  ) {
    if (!formRef) return;
    try {
      await formRef.validateFields([["accounts", index, field]]);
      persistRow(index);
    } catch (err: any) {
      // заменяем Uncaught на логирование
      console.warn("⚠ Ошибка валидации:", err?.errorFields);
    }
  }

  const rules = {
    tag: [{ max: 50 }],
    recordType: [{ required: true }],
    login: [{ required: true }, { max: 100 }],
    password: [{ required: true }, { max: 100 }],
  };

  const columns = [
    { title: "Метки", dataIndex: "tag" },
    { title: "Тип записи", dataIndex: "recordType" },
    { title: "Логин", dataIndex: "login" },
    { title: "Пароль", dataIndex: "password" },
    { title: "", dataIndex: "actions" },
  ] as const;

  const mergedColumns = computed(() =>
    columns.map(col => {
      if (col.dataIndex === "login") {
        return {
          ...col,
          customCell: (record: AccountRow) =>
            record.recordType === RecordTypes.LDAP ? { colSpan: 2 } : {},
        };
      }
      if (col.dataIndex === "password") {
        return {
          ...col,
          customCell: (record: AccountRow) =>
            record.recordType === RecordTypes.LDAP ? { colSpan: 0 } : {},
        };
      }
      return col;
    })
  );

  hydrate();

  return {
    // state
    formRows: state.formRows,
    accounts: state.accounts,

    // enums
    RecordTypes,

    // ui
    mergedColumns,
    rules,

    // actions
    addAccount,
    removeAccount,
    onRecordTypeChange,
    saveField,
  };
});
