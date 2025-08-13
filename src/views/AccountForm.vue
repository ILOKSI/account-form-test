<template>
  <div class="form-box">
    <div class="header">
      <h2>Учётные записи</h2>
      <a-button class="add-button" @click="store.addAccount">
        <PlusOutlined />
      </a-button>
    </div>

    <div class="form-hint">
      <QuestionCircleOutlined class="hint-icon" />
      <h3>Для нескольких меток для одной пары логин/пароль используйте разделитель ;</h3>
    </div>

    <a-form ref="formRef" layout="vertical" :model="{ accounts: store.formRows }">
      <a-table
        :dataSource="store.formRows"
        :columns="store.mergedColumns"
        :pagination="false"
        rowKey="id"
        :bordered="false"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'tag'">
            <a-form-item
              :name="['accounts', index, 'tagString']"
              :rules="store.rules.tag"
              validateTrigger="blur"
            >
              <a-input
                v-model:value="record.tagString"
                :maxLength="50"
                @blur="() => store.saveField(index, 'tagString', formRef)"
              />
            </a-form-item>
          </template>

          <template v-else-if="column.dataIndex === 'recordType'">
            <a-form-item
              :name="['accounts', index, 'recordType']"
              :rules="store.rules.recordType"
            >
              <a-select
                v-model:value="record.recordType"
                @change="val => store.onRecordTypeChange(index, val)"
              >
                <a-select-option :value="store.RecordTypes.LDAP">LDAP</a-select-option>
                <a-select-option :value="store.RecordTypes.Локальная">Локальная</a-select-option>
              </a-select>
            </a-form-item>
          </template>

          <template v-else-if="column.dataIndex === 'login'">
            <a-form-item
              :name="['accounts', index, 'login']"
              :rules="store.rules.login"
              validateTrigger="blur"
            >
              <a-input
                v-model:value="record.login"
                :maxLength="100"
                @blur="() => store.saveField(index, 'login', formRef)"
              />
            </a-form-item>
          </template>

          <template v-else-if="column.dataIndex === 'password' && record.recordType === store.RecordTypes.Локальная">
            <a-form-item
              :name="['accounts', index, 'password']"
              :rules="store.rules.password"
              validateTrigger="blur"
            >
              <a-input-password
                v-model:value="record.password"
                :maxLength="100"
                @blur="() => store.saveField(index, 'password', formRef)"
              />
            </a-form-item>
          </template>

          <template v-else-if="column.dataIndex === 'actions'">
            <a-button type="text" class="delete_button" @click="store.removeAccount(index)">
              <DeleteOutlined />
            </a-button>
          </template>
        </template>
      </a-table>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { FormInstance } from "ant-design-vue";
import { PlusOutlined, DeleteOutlined, QuestionCircleOutlined } from "@ant-design/icons-vue";
import { useAccountsStore } from "@/stores/accounts.store";

const store = useAccountsStore();
const formRef = ref<FormInstance>();
</script>

<style scoped>
/* Шапка */
.header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-box{
  width: 85vw;
}
.form-hint {
  display: flex;
  align-items: center;
  gap: 6px;
}
.hint-icon {
  font-size: 18px;
}

:deep(.ant-table-cell) {
  vertical-align: middle !important;
}

:deep(.ant-table-cell),
:deep(.ant-table-thead) {
  border: none !important;
}

:deep(.ant-form-item) {
  margin-bottom: 0 !important;
}

:deep(.ant-form-item-explain) {
  display: none !important;
}
</style>
