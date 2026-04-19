# Bugfix Requirements Document

## Introduction

RecipeEdit组件中的图片上传功能无法正常工作。用户在选择图片后立即收到错误提示,导致无法上传封面图片。错误的根本原因是前端API调用路径与后端实际端点不匹配,导致HTTP 405 Method Not Allowed错误。

**影响范围**: 所有使用RecipeEdit组件上传图片的场景(新建菜谱和编辑菜谱)

**错误信息**: "the string did not match the expected pattern" (实际HTTP错误: 405 Method Not Allowed)

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 用户在RecipeEdit组件中选择图片文件 THEN 系统调用错误的API路径 `/api/upload` 导致405错误

1.2 WHEN 上传请求返回405错误 THEN 系统显示模糊的错误消息 "the string did not match the expected pattern" 而不是清晰的错误说明

1.3 WHEN 上传失败 THEN 图片无法上传,用户无法为菜谱添加封面图

### Expected Behavior (Correct)

2.1 WHEN 用户在RecipeEdit组件中选择图片文件 THEN 系统SHALL调用正确的API路径 `/api/recipes/upload` 并成功上传图片

2.2 WHEN 上传请求成功 THEN 系统SHALL返回图片URL并更新表单的cover字段

2.3 WHEN 上传过程中发生错误 THEN 系统SHALL显示清晰的错误消息帮助用户理解问题

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 用户选择不符合要求的图片(非图片文件) THEN 系统SHALL CONTINUE TO显示 "请选择图片文件" 的前端验证错误

3.2 WHEN 用户选择超过5MB的图片 THEN 系统SHALL CONTINUE TO显示 "图片不能超过 5MB" 的前端验证错误

3.3 WHEN 上传成功后 THEN 系统SHALL CONTINUE TO显示图片预览和 "上传成功 ✓" 的提示消息

3.4 WHEN 用户点击"更换图片"或"移除"按钮 THEN 系统SHALL CONTINUE TO正常执行相应的操作

3.5 WHEN 表单提交时cover字段为空 THEN 系统SHALL CONTINUE TO显示 "请上传封面图" 的验证错误

## Bug Condition Derivation

### Bug Condition Function

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type UploadRequest
  OUTPUT: boolean
  
  // 当API路径错误时触发bug
  RETURN X.apiPath = "/api/upload"
END FUNCTION
```

### Property Specification

```pascal
// Property: Fix Checking - Correct API Path
FOR ALL X WHERE isBugCondition(X) DO
  result ← uploadImage'(X)
  ASSERT result.apiPath = "/api/recipes/upload" 
    AND result.statusCode = 201 
    AND result.data.url IS NOT NULL
END FOR
```

### Preservation Goal

```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT uploadImage(X) = uploadImage'(X)
END FOR
```

**说明**:
- **F (uploadImage)**: 原始上传函数,使用错误路径 `/api/upload`
- **F' (uploadImage')**: 修复后的上传函数,使用正确路径 `/api/recipes/upload`
- **Bug Condition**: API路径配置为 `/api/upload`
- **Fix**: 将API路径更改为 `/api/recipes/upload`
- **Preservation**: 前端验证、错误处理、UI交互等其他行为保持不变
