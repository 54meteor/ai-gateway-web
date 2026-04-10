<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  createUser,
  updateUser,
  deleteUser,
  recharge,
  resetBalance,
  type User
} from "@/api/userManage";

const props = defineProps<{
  visible: boolean;
  mode: "create" | "update" | "recharge" | "reset" | "delete";
  user?: User;
}>();

const emit = defineEmits<{
  (e: "update:visible", v: boolean): void;
  (e: "success"): void;
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (v) => emit("update:visible", v)
});

const titleMap = {
  create: "新增用户",
  update: "编辑用户",
  recharge: "余额充值",
  reset: "重置余额",
  delete: "删除用户"
};

const dialogTitle = computed(() => titleMap[props.mode]);

const formData = reactive({
  email: "",
  phone: "",
  username: "",
  amount: 0
});

watch(
  () => props.visible,
  (val) => {
    if (val && props.user) {
      formData.email = props.user.email || "";
      formData.phone = props.user.phone || "";
      formData.username = props.user.username || "";
      formData.amount = 0;
    } else if (val) {
      formData.email = "";
      formData.phone = "";
      formData.username = "";
      formData.amount = 0;
    }
  }
);

async function handleSubmit() {
  try {
    if (props.mode === "create") {
      await createUser({
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        username: formData.username || undefined
      });
      ElMessage.success("创建成功");
    } else if (props.mode === "update") {
      await updateUser({
        user_id: props.user!.id!,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        username: formData.username || undefined
      });
      ElMessage.success("更新成功");
    } else if (props.mode === "recharge") {
      await recharge(props.user!.id!, formData.amount);
      ElMessage.success("充值成功");
    } else if (props.mode === "reset") {
      await resetBalance(props.user!.id!);
      ElMessage.success("余额已重置");
    } else if (props.mode === "delete") {
      await deleteUser(props.user!.id!);
      ElMessage.success("删除成功");
    }
    dialogVisible.value = false;
    emit("success");
  } catch (err: any) {
    ElMessage.error(err?.message || err?.error || "操作失败");
  }
}
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
    <el-form v-if="mode !== 'delete' && mode !== 'reset'" label-width="80px">
      <!-- 删除/重置确认 -->
      <template v-if="mode === 'delete'">
        <p>确定删除用户 <strong>{{ user?.email || user?.username }}</strong> 吗？</p>
        <p style="color: #999; font-size: 12px; margin-top: 10px;">
          删除将同时删除该用户的所有 API Key 和用量记录，此操作不可撤销。
        </p>
      </template>

      <template v-else-if="mode === 'reset'">
        <p>确定重置用户 <strong>{{ user?.email || user?.username }}</strong> 的余额吗？</p>
        <p style="color: #999; font-size: 12px; margin-top: 10px;">此操作不可撤销。</p>
      </template>

      <!-- 充值 -->
      <template v-else-if="mode === 'recharge'">
        <p style="margin-bottom: 20px;">
          当前用户：<strong>{{ user?.email || user?.username }}</strong><br/>
          当前余额：<strong>¥ {{ user?.balance?.toFixed(4) || "0.0000" }}</strong>
        </p>
        <el-form-item label="充值金额">
          <el-input-number
            v-model="formData.amount"
            :min="0.01"
            :max="999999"
            :precision="4"
            :step="10"
            style="width: 100%"
          />
        </el-form-item>
      </template>

      <!-- 创建/编辑 -->
      <template v-else>
        <p style="color: #999; font-size: 12px; margin-bottom: 15px;">
          邮箱、手机号、用户名至少填写一项。
        </p>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
      </template>
    </el-form>

    <!-- 删除/重置时不需要表单 -->
    <div v-else-if="mode === 'delete' || mode === 'reset'" style="color: #666;">
      <p v-if="mode === 'reset'">
        确定重置用户 <strong>{{ user?.email || user?.username }}</strong> 的余额吗？此操作不可撤销。
      </p>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        v-if="mode === 'delete' || mode === 'reset'"
        type="danger"
        @click="handleSubmit"
      >
        确定
      </el-button>
      <el-button v-else type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
