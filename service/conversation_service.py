import json
import os
import asyncio
import time

import server
from aiohttp import web

# 使用内存字典存储会话消息
session_messages = {}

# 在文件开头添加
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")

def get_workflow_templates():
    templates = []
    workflows_dir = os.path.join(STATIC_DIR, "workflows")
    
    for filename in os.listdir(workflows_dir):
        if filename.endswith('.json'):
            with open(os.path.join(workflows_dir, filename), 'r') as f:
                template = json.load(f)
                templates.append(template)
    
    return templates

@server.PromptServer.instance.routes.get("/workspace/fetch_messages_by_id")
async def fetch_messages(request):
    session_id = request.query.get('session_id')
    data = await asyncio.to_thread(fetch_messages_sync, session_id)
    return web.json_response(data)

def fetch_messages_sync(session_id):
    print("fetch_messages: ", session_id)
    return session_messages.get(session_id, [])

@server.PromptServer.instance.routes.post("/workspace/workflow_gen")
async def workflow_gen(request):
    print("Received workflow_gen request")
    req_json = await request.json()
    print("Request JSON:", req_json)
    
    response = web.StreamResponse(
        status=200,
        reason='OK',
        headers={
            'Content-Type': 'application/json',
            'X-Content-Type-Options': 'nosniff'
        }
    )
    await response.prepare(request)
    
    session_id = req_json.get('session_id')
    user_message = req_json.get('message')
    
    # 创建用户消息
    user_msg = {
        "id": str(len(session_messages.get(session_id, []))),
        "content": user_message,
        "role": "user"
    }
    
    # 创建AI响应消息
    msg_id = str(len(session_messages.get(session_id, [])) + 1)
    
    if "workflow" in user_message.lower():
        # 发送初始消息结构
        ai_msg = {
            "id": msg_id,
            "content": json.dumps({
                "ai_message": "",
                "options": []
            }),
            "role": "ai",
            "name": "Assistant",
            "type": "workflow_option"
        }
        await response.write(json.dumps(ai_msg).encode() + b"\n")
        
        # 流式返回消息
        message = "Let me help you choose a workflow. Here are some options available:"
        for char in message:
            chunk_data = {
                "id": msg_id,
                "content": char,
                "role": "ai",
                "name": "Assistant",
                "type": "workflow_option",
                "is_chunk": True
            }
            await response.write(json.dumps(chunk_data).encode() + b"\n")
            await asyncio.sleep(0.01)
            
        # 等待2秒后发送带选项的完整消息
        await asyncio.sleep(2)
        workflows_dir = os.path.join(STATIC_DIR, "workflows")
        ai_msg = {
            "id": msg_id,
            "content": json.dumps({
                "ai_message": message,
                "options": [
                    {
                        "name": "basic_image_gen",
                        "description": "Create a basic image generation workflow",
                        "thumbnail": "https://placehold.co/600x400",
                        "dir": os.path.join(workflows_dir, "basic_image_gen.json"),
                        "workflow": """{
  "last_node_id": 9,
  "last_link_id": 9,
  "nodes": [
    {
      "id": 7,
      "type": "CLIPTextEncode",
      "pos": {
        "0": 413,
        "1": 389
      },
      "size": {
        "0": 425.27801513671875,
        "1": 180.6060791015625
      },
      "flags": {},
      "order": 3,
      "mode": 0,
      "inputs": [
        {
          "name": "clip",
          "type": "CLIP",
          "link": 5
        }
      ],
      "outputs": [
        {
          "name": "CONDITIONING",
          "type": "CONDITIONING",
          "links": [
            6
          ],
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "CLIPTextEncode"
      },
      "widgets_values": [
        "text, watermark"
      ]
    },
    {
      "id": 6,
      "type": "CLIPTextEncode",
      "pos": {
        "0": 415,
        "1": 186
      },
      "size": {
        "0": 422.84503173828125,
        "1": 164.31304931640625
      },
      "flags": {},
      "order": 2,
      "mode": 0,
      "inputs": [
        {
          "name": "clip",
          "type": "CLIP",
          "link": 3
        }
      ],
      "outputs": [
        {
          "name": "CONDITIONING",
          "type": "CONDITIONING",
          "links": [
            4
          ],
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "CLIPTextEncode"
      },
      "widgets_values": [
        "beautiful scenery nature glass bottle landscape, , purple galaxy bottle,"
      ]
    },
    {
      "id": 5,
      "type": "EmptyLatentImage",
      "pos": {
        "0": 473,
        "1": 609
      },
      "size": {
        "0": 315,
        "1": 106
      },
      "flags": {},
      "order": 0,
      "mode": 0,
      "inputs": [],
      "outputs": [
        {
          "name": "LATENT",
          "type": "LATENT",
          "links": [
            2
          ],
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "EmptyLatentImage"
      },
      "widgets_values": [
        512,
        512,
        1
      ]
    },
    {
      "id": 3,
      "type": "KSampler",
      "pos": {
        "0": 863,
        "1": 186
      },
      "size": {
        "0": 315,
        "1": 262
      },
      "flags": {},
      "order": 4,
      "mode": 0,
      "inputs": [
        {
          "name": "model",
          "type": "MODEL",
          "link": 1
        },
        {
          "name": "positive",
          "type": "CONDITIONING",
          "link": 4
        },
        {
          "name": "negative",
          "type": "CONDITIONING",
          "link": 6
        },
        {
          "name": "latent_image",
          "type": "LATENT",
          "link": 2
        }
      ],
      "outputs": [
        {
          "name": "LATENT",
          "type": "LATENT",
          "links": [
            7
          ],
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "KSampler"
      },
      "widgets_values": [
        156680208700286,
        "randomize",
        20,
        8,
        "euler",
        "normal",
        1
      ]
    },
    {
      "id": 8,
      "type": "VAEDecode",
      "pos": {
        "0": 1209,
        "1": 188
      },
      "size": {
        "0": 210,
        "1": 46
      },
      "flags": {},
      "order": 5,
      "mode": 0,
      "inputs": [
        {
          "name": "samples",
          "type": "LATENT",
          "link": 7
        },
        {
          "name": "vae",
          "type": "VAE",
          "link": 8
        }
      ],
      "outputs": [
        {
          "name": "IMAGE",
          "type": "IMAGE",
          "links": [
            9
          ],
          "slot_index": 0
        }
      ],
      "properties": {
        "Node name for S&R": "VAEDecode"
      }
    },
    {
      "id": 9,
      "type": "SaveImage",
      "pos": {
        "0": 1451,
        "1": 189
      },
      "size": {
        "0": 210,
        "1": 58
      },
      "flags": {},
      "order": 6,
      "mode": 0,
      "inputs": [
        {
          "name": "images",
          "type": "IMAGE",
          "link": 9
        }
      ],
      "outputs": [],
      "properties": {
        "Node name for S&R": "SaveImage"
      },
      "widgets_values": [
        "ComfyUI"
      ]
    },
    {
      "id": 4,
      "type": "CheckpointLoaderSimple",
      "pos": {
        "0": 26,
        "1": 474
      },
      "size": {
        "0": 315,
        "1": 98
      },
      "flags": {},
      "order": 1,
      "mode": 0,
      "inputs": [],
      "outputs": [
        {
          "name": "MODEL",
          "type": "MODEL",
          "links": [
            1
          ],
          "slot_index": 0
        },
        {
          "name": "CLIP",
          "type": "CLIP",
          "links": [
            3,
            5
          ],
          "slot_index": 1
        },
        {
          "name": "VAE",
          "type": "VAE",
          "links": [
            8
          ],
          "slot_index": 2
        }
      ],
      "properties": {
        "Node name for S&R": "CheckpointLoaderSimple"
      },
      "widgets_values": [
        "AOM3A3.safetensors"
      ]
    }
  ],
  "links": [
    [
      1,
      4,
      0,
      3,
      0,
      "MODEL"
    ],
    [
      2,
      5,
      0,
      3,
      3,
      "LATENT"
    ],
    [
      3,
      4,
      1,
      6,
      0,
      "CLIP"
    ],
    [
      4,
      6,
      0,
      3,
      1,
      "CONDITIONING"
    ],
    [
      5,
      4,
      1,
      7,
      0,
      "CLIP"
    ],
    [
      6,
      7,
      0,
      3,
      2,
      "CONDITIONING"
    ],
    [
      7,
      3,
      0,
      8,
      0,
      "LATENT"
    ],
    [
      8,
      4,
      2,
      8,
      1,
      "VAE"
    ],
    [
      9,
      8,
      0,
      9,
      0,
      "IMAGE"
    ]
  ],
  "groups": [],
  "config": {},
  "extra": {
    "ds": {
      "scale": 0.45,
      "offset": [
        1354.2777777777778,
        331.44444444444446
      ]
    }
  },
  "version": 0.4
}""" # workflow content here
                    },
                ]
            }),
            "role": "ai",
            "name": "Assistant",
            "type": "workflow_option"
        }
        
    elif "explain" in user_message.lower():
        # 发送初始消息结构
        ai_msg = {
            "id": msg_id,
            "content": "",
            "role": "ai",
            "name": "Assistant",
            "type": "message"
        }
        await response.write(json.dumps(ai_msg).encode() + b"\n")
        
        explanation = """
        The Load Checkpoint node can be used to load a diffusion model, 
        diffusion models are used to denoise latents. 
        This node will also provide the appropriate VAE and CLIP model.

        Inputs
        ckpt_name
        The name of the model.

        Outputs
        MODEL
        The model used for denoising latents.

        CLIP
        The CLIP model used for encoding text prompts.

        VAE
        The VAE model used for encoding and decoding images to and from latent space.
        """
        
        for char in explanation:
            chunk_data = {
                "id": msg_id,
                "content": char,
                "role": "ai",
                "name": "Assistant",
                "type": "message",
                "is_chunk": True
            }
            await response.write(json.dumps(chunk_data).encode() + b"\n")
            await asyncio.sleep(0.01)
            
        ai_msg = {
            "id": msg_id,
            "content": explanation,
            "role": "ai",
            "name": "Assistant",
            "type": "message"
        }
        
    elif "node search" in user_message.lower():
        existing_nodes = [
            {"name": "CLIPTextEncode", "description": "Encode text prompts for conditioning.", "github_url": "https://github.com/CompVis/clip-interrogator"},
            {"name": "VAEDecode", "description": "Decode latents to images.", "github_url": "https://github.com/CompVis/taming-transformers"},
            {"name": "KSampler", "description": "Generate images using K-diffusion sampling.", "github_url": "https://github.com/CompVis/k-diffusion"}
        ]
        non_existing_nodes = [
            {"name": "Upscale", "description": "Upscale images to a higher resolution.", "github_url": "https://github.com/lllyasviel/ControlNet/blob/main/examples/upscale.py"},
            {"name": "GFPGAN", "description": "Enhance and restore faces in images.", "github_url": "https://github.com/TencentARC/GFPGAN"},
            {"name": "RealESRGAN", "description": "Enhance and restore images using Real-ESRGAN.", "github_url": "https://github.com/xinntao/Real-ESRGAN"}
        ]
        ai_msg = {
            "id": msg_id,
            "content": json.dumps({
                "existing_nodes": existing_nodes,
                "non_existing_nodes": non_existing_nodes
            }),
            "role": "ai",
            "name": "Assistant",
            "type": "node_search"
        }
    else:
        # 发送初始消息结构
        ai_msg = {
            "id": msg_id,
            "content": json.dumps({
                "ai_message": "",
                "options": []
            }),
            "role": "ai",
            "name": "Assistant",
            "type": "message"
        }
        await response.write(json.dumps(ai_msg).encode() + b"\n")
        
        # 流式返回消息
        message = "I can help you with the workflow. Here are some options:"
        for char in message:
            chunk_data = {
                "id": msg_id,
                "content": char,
                "role": "ai",
                "name": "Assistant",
                "type": "message",
                "is_chunk": True
            }
            await response.write(json.dumps(chunk_data).encode() + b"\n")
            await asyncio.sleep(0.01)
        
        # 等待2秒后发送带选项的完整消息
        await asyncio.sleep(2)
        ai_msg = {
            "id": msg_id,
            "content": json.dumps({
                "ai_message": message,
                "options": [
                    "Create a basic image generation workflow",
                    "Set up an image upscaling pipeline",
                    "Build a face restoration workflow"
                ]
            }),
            "role": "ai",
            "name": "Assistant",
            "type": "message"
        }
    
    # 将消息添加到会话历史中
    if session_id not in session_messages:
        session_messages[session_id] = []
    
    session_messages[session_id].extend([user_msg, ai_msg])
    
    # 发送最终的完整消息
    await response.write(json.dumps(ai_msg).encode() + b"\n")
    await response.write_eof()
    return response
