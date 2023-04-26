import { NodeView, DynamicControl } from '../../../view';
import { Sockets } from '../../../sockets';
import { ExtendReteNode, Rete, ValueType } from '../../../types';
import { RC } from '../../ReteComponent';
import { ShaderGraphCompiler, SGNodeOutput } from '../../../compilers';
import { SGNodeData } from '../../../editors';

export type ReteDDYNode = ExtendReteNode<
  'DDY',
  {
    inValue: number | number[];
    inValueType: ValueType;
    outValue: number | number[];
    outValueType: ValueType;
  }
>;

export class DDYRC extends RC {
  constructor() {
    super('DDY');
    this.data.component = NodeView;
  }

  initNode(node: ReteDDYNode) {
    const { data, meta } = node;
    node.initValueType('in', 0, ValueType.float);
    node.initValueType('out', 0, ValueType.float);
    data.expanded ??= true;

    meta.previewDisabled = false;
    meta.category = 'math/derivative';
  }

  async builder(node: ReteDDYNode) {
    this.initNode(node);
    const a = new Rete.Input('in', 'In', Sockets.dynamicVector);
    const out = new Rete.Output('out', 'Out', Sockets.dynamicVector);

    a.addControl(new DynamicControl('in', node));
    node.addOutput(out).addInput(a);
  }

  compileSG(compiler: ShaderGraphCompiler, node: SGNodeData<ReteDDYNode>): SGNodeOutput {
    const outVar = compiler.getOutVarName(node, 'out', 'ddy');
    const inVar = compiler.getInputVarCoverted(node, 'in');
    return {
      outputs: { out: outVar },
      code: `let ${outVar} = dpdy(${inVar});`,
    };
  }
}
