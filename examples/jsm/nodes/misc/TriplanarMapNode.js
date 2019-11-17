/**
 *  @author scrubs / https://www.mecabricks.com
 */

import { TempNode } from '../core/TempNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { NormalNode } from '../accessors/NormalNode.js';
import { PositionNode } from '../accessors/PositionNode.js';

class TriplanarMapNode extends TempNode {
    constructor(texture, scale, rotation) {
        super('v4');

        this.texture = texture;
		this.scale = scale;
		this.rotation = rotation;
    }

    generate(builder, output) {
        let mapping = new FunctionNode([
            'vec4 triplanar_mapping(sampler2D texture, vec3 normal, vec3 position, float scale, vec3 rotation) {',

            // Asymmetric Triplanar Blend
            // https://medium.com/@bgolus/normal-mapping-for-a-triplanar-shader-10bf39dca05a
            '   vec3 blend = vec3(0.0);',
            '   vec2 xzBlend = abs(normalize(normal.xz));',
            '   blend.xz = max(vec2(0.0), xzBlend - 0.67);',
            '   blend.xz /= dot(blend.xz, vec2(1.0));',
            '   blend.y = clamp((abs(normal.y) - 0.675) * 80.0, 0.0, 1.0);',
			'   blend.xz *= (1.0 - blend.y);',
			'   blend.x = clamp(blend.x, 0.0, 1.0);',
			'   blend.z = clamp(blend.z, 0.0, 1.0);',
            
			'   mat2 rotx = mat2(cos(rotation.x),-sin(rotation.x),',
			'				     sin(rotation.x), cos(rotation.x));',
			'   mat2 roty = mat2(cos(rotation.y),-sin(rotation.y),',
			'				     sin(rotation.y), cos(rotation.y));',
			'   mat2 rotz = mat2(cos(rotation.z),-sin(rotation.z),',
			'				     sin(rotation.z), cos(rotation.z));',

			// Triplanar mapping
			'	vec2 tx = rotx * position.yz * scale;',
			'	vec2 ty = roty * position.zx * scale;',
			'	vec2 tz = rotz * position.xy * scale;',

			// Base color
			'	vec4 cx = texture2D(texture, tx) * blend.x;',
			'	vec4 cy = texture2D(texture, ty) * blend.y;',
			'	vec4 cz = texture2D(texture, tz) * blend.z;',
			'	return cx + cy + cz;',
			'}'
        ].join('\n'), null, {derivatives: true});

        let inputs = [
            this.texture.build(builder, 'sampler2D'),
            new NormalNode(NormalNode.LOCAL).build(builder, 'v3'),
            new PositionNode(PositionNode.LOCAL).build(builder, 'v3'),
			this.scale.build(builder, 'f'),
			this.rotation.build(builder, 'vec3')
        ];

        return builder.format(builder.include(mapping) + '(' + inputs.join(', ') + ')',
            this.getType(builder), output
        );
    }
}

export { TriplanarMapNode };
