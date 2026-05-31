<template>
  <Form
      v-slot="$form"
      :resolver="resolver"
      :initial-values="initialValues"
      :validate-on-value-update="false"
      validate-on-blur
      @submit="onFormSubmit"
      class="login-form"
  >
    <FormField v-slot="$field" name="email" class="form-field">
      <label for="login-email">Email</label>
      <IconField>
        <InputIcon class="pi pi-envelope"/>
        <InputText id="login-email" v-bind="$field.props" type="email" placeholder="voce@empresa.com" fluid/>
      </IconField>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
      </Message>
    </FormField>

    <FormField v-slot="$field" name="password" class="form-field">
      <label for="login-password">Senha</label>
      <IconField>
        <InputIcon class="pi pi-lock"/>
        <InputText id="login-password" v-bind="$field.props" type="password" placeholder="Sua senha" fluid/>
      </IconField>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
      </Message>
    </FormField>

    <Button
        type="submit"
        icon="pi pi-arrow-right"
        icon-pos="right"
        label="Entrar"
        :loading="isSubmitting"
        :disabled="!$form.valid || isSubmitting"
        class="submit-button"
    />
  </Form>
</template>

<script setup lang="ts">
import z from 'zod'
import {ref} from 'vue'
import router from "@/router";
import Button from 'primevue/button'
import Message from 'primevue/message'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import {useToast} from 'primevue/usetoast';
import {Form, FormField} from '@primevue/forms'
import {zodResolver} from '@primevue/forms/resolvers/zod'
import {useAuthStore} from "@/stores/auth-store.ts";
import type ResponseAPI from "@/utils/ResponseAPI.ts";
import type {FormSubmitEvent} from '@primevue/forms/form'
import type {UserLogin} from '@/types/auth/UserLogin'
import {showErrorToast, showSuccessToast} from '@/utils/toast.ts';

const toast = useToast();
const authStore = useAuthStore();
const isSubmitting = ref(false);

const LoginRules = z.object({
  email: z.email('Informe um email válido.'),
  password: z.string().min(1, 'Informe sua senha.')
})

const resolver = zodResolver(LoginRules);

const initialValues: UserLogin = {
  email: "",
  password: "",
};

const onFormSubmit = async ({valid, values}: FormSubmitEvent) => {
  if (!valid || isSubmitting.value)
    return;

  isSubmitting.value = true;

  const result: ResponseAPI<string> = await authStore.login(values as UserLogin);

  if (result.isError) {
    showErrorToast(toast, result.response);
    isSubmitting.value = false;
    return;
  }

  showSuccessToast(toast, result.response);

  await router.push({name: 'Home'});

  isSubmitting.value = false;
}
</script>

<style scoped>
.login-form {
  display: grid;
  gap: 18px;
  width: 100%;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.form-field label {
  color: #d9e4ff;
  font-size: 0.9rem;
  font-weight: 700;
}

.form-field :deep(.p-inputtext) {
  width: 100%;
  min-height: 46px;
  border-color: rgba(88, 111, 187, 0.44);
  border-radius: 12px;
  color: #f8fafc;
  background: rgba(10, 16, 38, 0.86);
}

.form-field :deep(.p-inputtext:enabled:focus) {
  border-color: #448dff;
  box-shadow: 0 0 0 4px rgba(68, 141, 255, 0.16);
}

.form-field :deep(.p-inputicon) {
  color: #7d8fc3;
}

.form-field :deep(.p-message-text) {
  line-height: 1.35;
}

.submit-button {
  min-height: 48px;
  margin-top: 8px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #1d8cff);
  font-weight: 800;
  box-shadow: 0 16px 34px rgba(29, 140, 255, 0.24);
}

.submit-button:not(:disabled):hover {
  background: linear-gradient(135deg, #6d28d9, #1276e6);
}
</style>
