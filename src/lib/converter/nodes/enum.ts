import * as assert from "assert";
import * as ts from "typescript";
import type { ReflectionConverter } from "./types";
import { EnumReflection, EnumMemberReflection } from "../../models";

export const enumConverter: ReflectionConverter<
  ts.EnumDeclaration,
  EnumReflection
> = {
  kind: [ts.SyntaxKind.EnumDeclaration],
  async convert(context, symbol) {
    const isConst = Boolean(symbol.flags & ts.SymbolFlags.ConstEnum);
    const container = new EnumReflection(symbol.name, isConst);
    context.project.registerReflection(container, symbol);

    await context.convertChildren(
      context.getExportsOfKind(symbol, ts.SyntaxKind.EnumMember),
      container
    );

    return container;
  },
};

export const enumMemberConverter: ReflectionConverter<
  ts.EnumMember,
  EnumMemberReflection
> = {
  kind: [ts.SyntaxKind.EnumMember],
  convert(context, symbol, [node]) {
    const value = context.checker.getConstantValue(node);
    assert(
      value !== undefined,
      "Failed to get the value of an enum. This is probably a bug."
    );

    const member = new EnumMemberReflection(symbol.name, value);
    context.project.registerReflection(member, symbol);
    return member;
  },
};
