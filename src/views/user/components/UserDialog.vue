<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  createUser,
  updateUser,
  deleteUser,
  recharge,
  resetBalance,
  createKey,
  resetKey,
  type User
} from "@/api/userManage";

const props = defineProps<{
  visible: boolean;
  mode: "create" | "update" | "recharge" | "reset" | "delete" | "createKey" | "resetKey";
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
  delete: "删除用户",
  createKey: "生成 API Key",
  resetKey: "重置 API Key"
};

const dialogTitle = computed(() => titleMap[props.mode]);

const formData = reactive({
  email: "",
  phone: "",
  username: "",
  amount: 0
});

// 显示新生成的 Key
const newApiKey = reactive({
  value: "",
  visible: false
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
    // 重置 Key 显示
    newApiKey.value = "";
    newApiKey.visible = false;
  }
);

// 自动复制到剪贴板
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success("已复制到剪贴板");
  } catch {
    ElMessage.warning("复制失败，请手动复制");
  }
}

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
    } else if (props.mode === "createKey") {
      const res = await createKey(props.user!.id!);
      if (res.success) {
        newApiKey.value = res.api_key;
        newApiKey.visible = true;
        // 自动复制
        await copyToClipboard(res.api_key);
        emit("success");
      }
    } else if (props.mode === "resetKey") {
      const res = await resetKey(props.user!.id!);
      if (res.success) {
        newApiKey.value = res.api_key;
        newApiKey.visible = true;
        // 自动复制
        await copyToClipboard(res.api_key);
        emit("success");
      }
    }
    // createKey/resetKey 不关闭弹窗，让用户看到新 Key 并手动复制
    if (props.mode !== "createKey" && props.mode !== "resetKey") {
      dialogVisible.value = false;
    }
  } catch (err: any) {
    ElMessage.error(err?.message || err?.error || "操作失败");
  }
}
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
    <el-form v-if="mode !== 'delete' && mode !== 'reset' && mode !== 'createKey' && mode !== 'resetKey'" label-width="80px">
      <!-- 删除确认 -->
      <template v-if="mode === 'delete'">
        <p>确定删除用户 <strong>{{ user?.email || user?.username }}</strong> 吗？</p>
        <p style="color: #999; font-size: 12px; margin-top: 10px;">
          删除将同时删除该用户的所有 API Key 和用量记录，此操作不可撤销。
        </p>
      </template>

      <!-- 重置余额确认 -->
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

    <!-- 重置余额确认（简化版） -->
    <div v-else-if="mode === 'reset'" style="color: #666;">
      <p>
        确定重置用户 <strong>{{ user?.email || user?.username }}</strong> 的余额吗？此操作不可撤销。
      </p>
    </div>

    <!-- 生成 Key 弹窗 -->
    <div v-else-if="mode === 'createKey'">
      <template v-if="!newApiKey.visible">
        <p style="margin-bottom: 15px;">
          确定要为用户 <strong>{{ user?.email || user?.username }}</strong> 生成 API Key 吗？
        </p>
        <p style="color: #e6a23c; font-size: 12px;">
          ⚠️ Key 生成后仅显示一次，请妥善保管！
        </p>
      </template>
      <template v-else>
        <p style="margin-bottom: 15px; color: #67c23a;">
          ✅ API Key 生成成功！
        </p>
        <p style="margin-bottom: 10px; font-size: 13px;">
          以下是生成的 API Key，请立即复制保存：
        </p>
        <div style="display: flex; gap: 10px; align-items: center;">
          <code style="flex: 1; padding: 10px; background: #f5f7fa; border-radius: 4px; font-family: monospace; word-break: break-all; color: #409eff; font-size: 13px;">
            {{ newApiKey.value }}
          </code>
          <el-button type="primary" @click="copyToClipboard(newApiKey.value)">复制</el-button>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 10px;">
          此窗口关闭后将无法再次查看完整 Key，如有需要请重置 Key。
        </p>
      </template>
    </div>

    <!-- 重置 Key 弹窗 -->
    <div v-else-if="mode === 'resetKey'">
      <template v-if="!newApiKey.visible">
        <p style="margin-bottom: 15px;">
          确定要重置用户 <strong>{{ user?.email || user?.username }}</strong> 的 API Key 吗？
        </p>
        <p style="color: #e6a23c; font-size: 12px;">
          ⚠️ 重置后旧 Key 将立即失效，新 Key 仅显示一次，请妥善保管！
        </p>
      </template>
      <template v-else>
        <p style="margin-bottom: 15px; color: #67c23a;">
          ✅ API Key 重置成功！
        </p>
        <p style="margin-bottom: 10px; font-size: 13px;">
          以下是新生成的 API Key，请立即复制保存：
        </p>
        <div style="display: flex; gap: 10px; align-items: center;">
          <code style="flex: 1; padding: 10px; background: #f5f7fa; border-radius: 4px; font-family: monospace; word-break: break-all; color: #409eff; font-size: 13px;">
            {{ newApiKey.value }}
          </code>
          <el-button type="primary" @click="copyToClipboard(newApiKey.value)">复制</el-button>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 10px;">
          此窗口关闭后将无法再次查看完整 Key，如有需要请重新重置。
        </p>
      </template>
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
      <el-button
        v-else-if="mode === 'createKey' && !newApiKey.visible"
        type="success"
        @click="handleSubmit"
      >
        确定生成
      </el-button>
      <el-button
        v-else-if="mode === 'resetKey' && !newApiKey.visible"
        type="warning"
        @click="handleSubmit"
      >
        确定重置
      </el-button>
      <el-button
        v-else-if="newApiKey.visible"
        type="primary"
        @click="dialogVisible = false"
      >
        我已保存，关闭
      </el-button>
      <el-button v-else type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
