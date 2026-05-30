<template>
  <Form @submit="onFormSubmit" class="flex flex-col gap-4 w-full sm:w-56">

    <FormField v-slot="$field" name="username" initialValue="" class="flex flex-col gap-1">
      <InputText type="text" placeholder="Username" v-model="user.username"/>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
      </Message>
    </FormField>

    <FormField v-slot="$field" name="email" initialValue="" class="flex flex-col gap-1">
      <InputText type="text" placeholder="Email" v-model="user.email"/>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
      </Message>
    </FormField>

    <FormField v-slot="$field" name="firstName" initialValue="" class="flex flex-col gap-1">
      <InputText type="text" placeholder="First Name" v-model="user.firstName"/>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
      </Message>
    </FormField>

    <FormField v-slot="$field" name="lastName" initialValue="" class="flex flex-col gap-1">
      <InputText type="text" placeholder="Last Name" v-model="user.lastName"/>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
      </Message>
    </FormField>

    <FormField v-slot="$field" name="password" initialValue="" class="flex flex-col gap-1">
      <InputText type="password" placeholder="Password" v-model="user.password"/>
      <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">{{ $field.error?.message }}
      </Message>
    </FormField>

    <Button type="submit" severity="secondary" label="Registrar"/>

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

const toast = useToast();
const authStore = useAuthStore();

const RegisterRules = z.object({
  email: z.email(),
  password: z.string().min(8),
  username: z.string().min(2).max(30),
  lastName: z.string().min(2).max(30),
  firstName: z.string().min(2).max(20)
})

const user = ref<import('@/types/auth/UserRegister').UserRegister>({
  username: "",
  lastName: "",
  firstName: "",
  email: "",
  password: "",
});

const onFormSubmit = async () => {
  const validation = RegisterRules.safeParse(user.value);

  if (!validation.success) {
    alert('Registro')
    return;
  }

  const result: ResponseAPI<string> = await authStore.register(user.value);

  if (result.isError) {
    toast.add({detail: result.response});
    return;
  }

  toast.add({detail: result.response});

  await router.push({name: 'Login'});
}
</script>
