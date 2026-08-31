-- AlterTable
ALTER TABLE "favoritos" ADD COLUMN     "id_usuario" INTEGER;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "professores"("id_professor") ON DELETE SET NULL ON UPDATE CASCADE;
