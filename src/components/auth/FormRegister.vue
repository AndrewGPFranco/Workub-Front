<template>
  <Form
      v-slot="$form"
      :resolver="resolver"
      :initial-values="initialValues"
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full sm:w-56"
  >

    <FormField v-slot="$field" name="username" class="flex flex-col gap-1">
      <InputText v-bind="$field.props" type="text" placeholder="Username"/>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
      </Message>
    </FormField>

    <FormField v-slot="$field" name="email" class="flex flex-col gap-1">
      <InputText v-bind="$field.props" type="email" placeholder="Email"/>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
      </Message>
    </FormField>

    <FormField v-slot="$field" name="firstName" class="flex flex-col gap-1">
      <InputText v-bind="$field.props" type="text" placeholder="First Name"/>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
      </Message>
    </FormField>

    <FormField v-slot="$field" name="lastName" class="flex flex-col gap-1">
      <InputText v-bind="$field.props" type="text" placeholder="Last Name"/>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
      </Message>
    </FormField>

    <FormField v-slot="$field" name="password" class="flex flex-col gap-1">
      <InputText v-bind="$field.props" type="password" placeholder="Password"/>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
      </Message>
    </FormField>

    <Button type="submit" severity="secondary" label="Registrar" :disabled="!$form.valid || isSubmitting"/>

  </Form>
</template>

<script setup lang="ts">
import z from 'zod'
import {ref} from 'vue'
import router from "@/router";
import Button from 'primevue/button'
import Message from 'primevue/message'
import InputText from 'primevue/inputtext'
import {useToast} from 'primevue/usetoast';
import {Form, FormField} from '@primevue/forms'
import {useAuthStore} from "@/stores/auth-store.ts";
import type ResponseAPI from "@/utils/ResponseAPI.ts";
import {zodResolver} from '@primevue/forms/resolvers/zod'
import type {FormSubmitEvent} from '@primevue/forms/form'
import type {UserRegister} from '@/types/auth/UserRegister'

const toast = useToast();
const authStore = useAuthStore();
const isSubmitting = ref(false);

const RegisterRules = z.object({
  email: z.email('Informe um email válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  username: z.string().min(2, 'O username deve ter pelo menos 2 caracteres.').max(30, 'O username deve ter no máximo 30 caracteres.'),
  lastName: z.string().min(2, 'O sobrenome deve ter pelo menos 2 caracteres.').max(30, 'O sobrenome deve ter no máximo 30 caracteres.'),
  firstName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.').max(20, 'O nome deve ter no máximo 20 caracteres.')
})

const resolver = zodResolver(RegisterRules);

const initialValues: UserRegister = {
  username: "",
  lastName: "",
  firstName: "",
  email: "",
  password: "",
};

const onFormSubmit = async ({valid, values}: FormSubmitEvent) => {
  if (!valid || isSubmitting.value)
    return;

  isSubmitting.value = true;

  const result: ResponseAPI<string> = await authStore.register(values as UserRegister);

  if (result.isError) {
    toast.add({detail: result.response});
    isSubmitting.value = false;
    return;
  }

  toast.add({detail: result.response});

  await router.push({name: 'Home'});

  isSubmitting.value = false;
}
</script>
